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

        //Add Method for updating a quiz by id
        




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