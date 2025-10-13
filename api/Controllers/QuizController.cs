using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using api.DTOs;
using api.Models;
using System.Security.Claims;

namespace api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class QuizController : ControllerBase
    {
        private readonly AuthUserDbContext _context;

        public QuizController(AuthUserDbContext context)
        {
            _context = context;
        }

        // POST: api/Quiz/create
        // Oppretter en ny quiz. Krever autentisering.
        [Authorize]
        [HttpPost("create")]
        public async Task<IActionResult> CreateQuiz([FromBody] QuizCreationDto quizDto)
        {
        
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            
            var rawIdentifier = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var subjectClaim = User.FindFirstValue("sub");
            var usernameFallback = User.Identity?.Name;

            Console.WriteLine($"[QuizController] Raw NameIdentifier claim: {rawIdentifier}");
            Console.WriteLine($"[QuizController] Sub claim: {subjectClaim}");
            Console.WriteLine($"[QuizController] Identity.Name: {usernameFallback}");

            string? resolvedUserId = null;

            // Først anta at claim allerede inneholder GUID Id (Identity primærnøkkel) som er den som skal knyttes opp mot user 
            if (!string.IsNullOrWhiteSpace(rawIdentifier))
            {
                var candidate = await _context.Users.FindAsync(rawIdentifier);
                if (candidate != null)
                {
                    resolvedUserId = candidate.Id; 
                }
            }

            
            if (resolvedUserId == null)
            {
                var possibleUsername = rawIdentifier ?? subjectClaim ?? usernameFallback;
                if (!string.IsNullOrWhiteSpace(possibleUsername))
                {
                    var userByName = await _context.Users.FirstOrDefaultAsync(u => u.UserName == possibleUsername);
                    if (userByName != null)
                    {
                        resolvedUserId = userByName.Id;
                        Console.WriteLine($"[QuizController] Resolved username '{possibleUsername}' to Id '{resolvedUserId}'.");
                    }
                }
            }

            if (resolvedUserId == null)
            {
                return Unauthorized(new { Message = "Kunne ikke validere bruker fra token (mangler eller ugyldig). Logg inn på nytt." });
            }

            //Sørg for at quizen har minst ett spørsmål og at hvert spørsmål har svar
            if (quizDto.Questions == null || !quizDto.Questions.Any())
                return BadRequest(new { Message = "Quiz må ha minst ett spørsmål." });
            if (quizDto.Questions.Any(q => q.Answers == null || !q.Answers.Any()))
                return BadRequest(new { Message = "Hvert spørsmål må ha minst ett svar." });

            var quiz = new Quiz
            {
                Title = quizDto.Title,
                Description = quizDto.Description,
                UserId = resolvedUserId,
                Questions = quizDto.Questions.Select(qDto => new Question
                {
                    QuestionText = qDto.QuestionText,
                    Points = qDto.Points,
                    Answers = qDto.Answers.Select(aDto => new Answer
                    {
                        AnswerText = aDto.AnswerText,
                        IsCorrect = aDto.IsCorrect
                    }).ToList()
                }).ToList()
            };

            _context.Quizzes.Add(quiz);
            try
            {
                await _context.SaveChangesAsync();
                return Ok(new { Message = "Quiz opprettet!", QuizId = quiz.Id });
            }
            catch (DbUpdateException ex)
            {
                
                Console.WriteLine($"[QuizController] DbUpdateException: {ex.Message}\nInner: {ex.InnerException?.Message}");
                return StatusCode(500, new { Message = "Lagring feilet (DbUpdateException). Sannsynligvis ugyldig brukerreferanse.", Detail = ex.InnerException?.Message });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[QuizController] Uventet feil: {ex}");
                return StatusCode(500, new { Message = "Uventet feil ved opprettelse av quiz.", Detail = ex.Message });
            }
        }

        // GET: api/Quiz
        // Henter en liste over alle tilgjengelige quizer.
        [HttpGet]
        public async Task<IActionResult> GetQuizzes()
        {
            // Bruker en LINQ-projeksjon for å velge kun nødvendige data og unngå overføring.
            var quizzes = await _context.Quizzes
                                      .Include(q => q.Creator) // Sikrer at Creator-info hentes
                                      .Select(q => new
                                      {
                                          q.Id,
                                          q.Title,
                                          q.Description,
                                          // Merk: Questions-samlingen må lastes (enten ivrig eller lat) 
                                          // for at .Count skal fungere i EF Core.
                                          QuestionCount = q.Questions.Count,
                                          // Vi bruker null-tilgivende operatoren på UserName her 
                                          // for å løse advarselen, da Creator er sjekket for null, 
                                          // og UserName generelt ikke er null på en autentisert bruker.
                                          Creator = q.Creator != null ? q.Creator.UserName! : "Unknown"
                                      })
                                      .ToListAsync();
            return Ok(quizzes);
        }

        // GET: api/Quiz/my
        // Henter alle quizzer som tilhører den innloggede brukeren.
        [Authorize]
        [HttpGet("my")]
        public async Task<IActionResult> GetMyQuizzes()
        {
            var rawIdentifier = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var subjectClaim = User.FindFirstValue("sub");
            var usernameFallback = User.Identity?.Name;

            string? resolvedUserId = null;

            // logik for at finde brugeren via JWT token claim
            if (!string.IsNullOrWhiteSpace(rawIdentifier))
            {
                var candidate = await _context.Users.FindAsync(rawIdentifier);
                if (candidate != null)
                {
                    resolvedUserId = candidate.Id; 
                }
            }

            // Hvis ikke funnet via Id, prøv å finne via brukernavn igjennom databasen
            if (resolvedUserId == null)
            {
                var possibleUsername = rawIdentifier ?? subjectClaim ?? usernameFallback;
                if (!string.IsNullOrWhiteSpace(possibleUsername))
                {
                    var userByName = await _context.Users.FirstOrDefaultAsync(u => u.UserName == possibleUsername);
                    if (userByName != null)
                    {
                        resolvedUserId = userByName.Id;
                    }
                }
            }

            if (resolvedUserId == null)
            {
                return Unauthorized(new { Message = "Kunne ikke validere bruker fra token." });
            }

            // Hent kun quizzer som tilhører den innloggede brukeren
            var myQuizzes = await _context.Quizzes
                                         .Where(q => q.UserId == resolvedUserId)
                                         .Include(q => q.Creator)
                                         .Select(q => new
                                         {
                                             q.Id,
                                             q.Title,
                                             q.Description,
                                             QuestionCount = q.Questions.Count,
                                             Creator = q.Creator != null ? q.Creator.UserName! : "Unknown"
                                         })
                                         .ToListAsync();
            
            return Ok(myQuizzes);
        }

        // GET: api/Quiz/{id}
        // Henter en spesifikk quiz via ID, uten de riktige svarene.
        [HttpGet("{id}")]
        public async Task<IActionResult> GetQuiz(int id)
        {
            // Eagerly laster spørsmål og deres svar for quizen
            var quiz = await _context.Quizzes
                .Include(q => q.Questions)
                .ThenInclude(q => q.Answers)
                .FirstOrDefaultAsync(q => q.Id == id);

            if (quiz == null)
            {
                return NotFound();
            }

            // Oppretter en anonym DTO for å sikre at 'IsCorrect' ikke blir eksponert for klienten.
            var quizDetails = new
            {
                quiz.Id,
                quiz.Title,
                Questions = quiz.Questions.Select(q => new
                {
                    q.Id,
                    q.QuestionText,
                    q.Points,
                    Answers = q.Answers.Select(a => new
                    {
                        a.Id,
                        a.AnswerText
                    }).ToList()
                }).ToList()
            };

            return Ok(quizDetails);
        }

        // GET: api/Quiz/{id}/edit
        // Henter en quiz for redigering med alle detaljer inkludert riktige svar.
        [Authorize]
        [HttpGet("{id}/edit")]
        public async Task<IActionResult> GetQuizForEdit(int id)
        {
            var rawIdentifier = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var subjectClaim = User.FindFirstValue("sub");
            var usernameFallback = User.Identity?.Name;

            string? resolvedUserId = null;

            // Først anta at claim allerede inneholder GUID Id
            if (!string.IsNullOrWhiteSpace(rawIdentifier))
            {
                var candidate = await _context.Users.FindAsync(rawIdentifier);
                if (candidate != null)
                {
                    resolvedUserId = candidate.Id; 
                }
            }

            // Fallback: prøv å finne bruker via brukernavn
            if (resolvedUserId == null)
            {
                var possibleUsername = rawIdentifier ?? subjectClaim ?? usernameFallback;
                if (!string.IsNullOrWhiteSpace(possibleUsername))
                {
                    var userByName = await _context.Users.FirstOrDefaultAsync(u => u.UserName == possibleUsername);
                    if (userByName != null)
                    {
                        resolvedUserId = userByName.Id;
                    }
                }
            }

            if (resolvedUserId == null)
            {
                return Unauthorized(new { Message = "Kunne ikke validere bruker fra token." });
            }

            // Hent quizen med alle detaljer
            var quiz = await _context.Quizzes
                .Include(q => q.Questions)
                .ThenInclude(q => q.Answers)
                .FirstOrDefaultAsync(q => q.Id == id);

            if (quiz == null)
            {
                return NotFound(new { Message = "Quiz ikke funnet." });
            }

            // Sjekk om brukeren eier quizen
            if (quiz.UserId != resolvedUserId)
            {
                return StatusCode(403, new { Message = "Du har ikke tilgang til å redigere denne quizen." });
            }

            // Returner full quiz data for redigering inkludert riktige svar
            var quizForEdit = new
            {
                quiz.Id,
                quiz.Title,
                quiz.Description,
                Questions = quiz.Questions.Select(q => new
                {
                    q.Id,
                    q.QuestionText,
                    q.Points,
                    Answers = q.Answers.Select(a => new
                    {
                        a.Id,
                        a.AnswerText,
                        a.IsCorrect
                    }).ToList()
                }).ToList()
            };

            return Ok(quizForEdit);
        }

        // PUT: api/Quiz/{id}
        // Oppdaterer en eksisterende quiz. Krever autentisering og eierskap.
        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateQuiz(int id, [FromBody] QuizCreationDto quizDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var rawIdentifier = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var subjectClaim = User.FindFirstValue("sub");
            var usernameFallback = User.Identity?.Name;

            string? resolvedUserId = null;

            // Først anta at claim allerede inneholder GUID Id
            if (!string.IsNullOrWhiteSpace(rawIdentifier))
            {
                var candidate = await _context.Users.FindAsync(rawIdentifier);
                if (candidate != null)
                {
                    resolvedUserId = candidate.Id; 
                }
            }

            // Fallback: prøv å finne bruker via brukernavn
            if (resolvedUserId == null)
            {
                var possibleUsername = rawIdentifier ?? subjectClaim ?? usernameFallback;
                if (!string.IsNullOrWhiteSpace(possibleUsername))
                {
                    var userByName = await _context.Users.FirstOrDefaultAsync(u => u.UserName == possibleUsername);
                    if (userByName != null)
                    {
                        resolvedUserId = userByName.Id;
                    }
                }
            }

            if (resolvedUserId == null)
            {
                return Unauthorized(new { Message = "Kunne ikke validere bruker fra token." });
            }

            // Valider quiz data
            if (quizDto.Questions == null || !quizDto.Questions.Any())
                return BadRequest(new { Message = "Quiz må ha minst ett spørsmål." });
            if (quizDto.Questions.Any(q => q.Answers == null || !q.Answers.Any()))
                return BadRequest(new { Message = "Hvert spørsmål må ha minst ett svar." });

            // Hent den eksisterende quizen
            var existingQuiz = await _context.Quizzes
                .Include(q => q.Questions)
                .ThenInclude(q => q.Answers)
                .FirstOrDefaultAsync(q => q.Id == id);

            if (existingQuiz == null)
            {
                return NotFound(new { Message = "Quiz ikke funnet." });
            }

            // Sjekk om brukeren eier quizen
            if (existingQuiz.UserId != resolvedUserId)
            {
                return StatusCode(403, new { Message = "Du har ikke tilgang til å oppdatere denne quizen." });
            }

            try
            {
                // Oppdater quiz-egenskaper
                existingQuiz.Title = quizDto.Title;
                existingQuiz.Description = quizDto.Description;

                // Fjern alle eksisterende spørsmål og svar (cascade delete)
                _context.Questions.RemoveRange(existingQuiz.Questions);

                // Legg til nye spørsmål og svar
                existingQuiz.Questions = quizDto.Questions.Select(qDto => new Question
                {
                    QuestionText = qDto.QuestionText,
                    Points = qDto.Points,
                    Answers = qDto.Answers.Select(aDto => new Answer
                    {
                        AnswerText = aDto.AnswerText,
                        IsCorrect = aDto.IsCorrect
                    }).ToList()
                }).ToList();

                await _context.SaveChangesAsync();
                return Ok(new { Message = "Quiz oppdatert!", QuizId = existingQuiz.Id });
            }
            catch (DbUpdateException ex)
            {
                Console.WriteLine($"[QuizController] DbUpdateException: {ex.Message}\nInner: {ex.InnerException?.Message}");
                return StatusCode(500, new { Message = "Oppdatering feilet (DbUpdateException).", Detail = ex.InnerException?.Message });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[QuizController] Uventet feil: {ex}");
                return StatusCode(500, new { Message = "Uventet feil ved oppdatering av quiz.", Detail = ex.Message });
            }
        }

        //Method for deleting a quiz by id
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteQuiz(int id)
        {
            // Find the quiz including its questions and answers (for cascade delete)
            var quiz = await _context.Quizzes
            .Include(q => q.Questions)
            .ThenInclude(q => q.Answers)
            .FirstOrDefaultAsync(q => q.Id == id);

            if (quiz == null)
                return NotFound(new { Message = "Quiz not found." });

            // Remove the quiz
            _context.Quizzes.Remove(quiz);
            await _context.SaveChangesAsync();

            // Return 204 No Content to indicate success
            return NoContent();
        }   
    
    
        // POST: api/Quiz/submit
        // Sender inn en quiz og beregner poengsummen.
        [HttpPost("submit")]
        public async Task<IActionResult> SubmitQuiz([FromBody] QuizSubmissionDto submissionDto)
        {
            // Eagerly laster hele quiz-strukturen (spørsmål og svar)
            var quiz = await _context.Quizzes
                .Include(q => q.Questions)
                .ThenInclude(q => q.Answers)
                .FirstOrDefaultAsync(q => q.Id == submissionDto.QuizId);

            if (quiz == null)
            {
                return NotFound("Quiz ikke funnet.");
            }

            var totalScore = 0;
            var correctAnswers = 0;
            var questionCount = quiz.Questions.Count;

            foreach (var question in quiz.Questions)
            {
                if (submissionDto.SelectedAnswers.TryGetValue(question.Id, out int selectedAnswerId))
                {
                    // Finner det riktige svaret for gjeldende spørsmål
                    var correctAnswer = question.Answers.FirstOrDefault(a => a.IsCorrect);
                    
                    if (correctAnswer != null && correctAnswer.Id == selectedAnswerId)
                    {
                        totalScore += question.Points;
                        correctAnswers++;
                    }
                }
            }

            return Ok(new
            {
                Score = totalScore,
                CorrectAnswers = correctAnswers,
                TotalQuestions = questionCount
            });
        }
    }
}