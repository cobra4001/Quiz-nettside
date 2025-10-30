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
        private readonly ILogger<QuizController> _logger;
        public QuizController(AuthUserDbContext context, ILogger<QuizController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // Helper method to resolve user ID from JWT token claims
        private async Task<string?> ResolveUserIdAsync()
        {
            var userId = await Task.Run(() => User.FindFirstValue(ClaimTypes.NameIdentifier));
            if (userId != null)
                return userId;
            else
                return null;
        }

        // POST: api/Quiz/create
        // Creating a new quiz. Requires authentication.
        [Authorize]
        [HttpPost("create")]
        public async Task<IActionResult> CreateQuiz([FromBody] QuizCreationDto quizDto)
        {

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = await ResolveUserIdAsync();
            if (userId == null)
            {
                return Unauthorized(new { Message = "Kunne ikke validere bruker fra token (mangler eller ugyldig). Logg inn på nytt." });
            }

            //format validation (questions and answers)
            if (quizDto.Questions == null || !quizDto.Questions.Any())
                return BadRequest(new { Message = "Quiz må ha minst ett spørsmål." });
            if (quizDto.Questions.Any(q => q.Answers == null || !q.Answers.Any()))
                return BadRequest(new { Message = "Hvert spørsmål må ha minst ett svar." });

            // Creates the quiz entry
            var quiz = new Quiz
            {
                Title = quizDto.Title,
                Description = quizDto.Description,
                UserId = userId,
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

            //submits to database and logs if unsuccessfull
            _context.Quizzes.Add(quiz);

            bool returnOk = await _context.SaveChangesAsync() > 0;
            if (returnOk)
                return Ok(new { Message = "Quiz opprettet!", QuizId = quiz.Id });

            _logger.LogError("[QuizController] Failed to create quiz for user {@userId}", userId);
            return StatusCode(500, new { Message = "Internal server error." });
            //Old code: delete if okay with Thomas
            /*try
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
            }*/
        }

        // GET: api/Quiz
        // Brings a list of all available quizzes
        
        //DENNE OG NÆSTE KAN VI EVENTULTIG BYTTE UD MED EN FÆLLES METODE SOM TAGER EN OPTIONAL USERID
        [HttpGet]
        public async Task<IActionResult> GetQuizzes()
        {
            // Using a LINQ projection to select only necessary data and avoid too much fetching/ too much posting.
            var quizzes = await _context.Quizzes
                                      .Include(q => q.Creator) // Secures that we can access Creator navigation property 
                                      .Select(q => new
                                      {
                                          q.Id,
                                          q.Title,
                                          q.Description,
                                          QuestionCount = q.Questions.Count,
                                          Creator = q.Creator != null ? q.Creator.UserName! : "Unknown"
                                      })
                                      .ToListAsync();
            return Ok(quizzes);
        }

        // GET: api/Quiz/my
        // Get quizzes created by the logged-in user.
        [Authorize]
        [HttpGet("my")]
        public async Task<IActionResult> GetMyQuizzes()
        {
            var resolvedUserId = await ResolveUserIdAsync();
            if (resolvedUserId == null)
            {
                return Unauthorized(new { Message = "could not validate user." });
            }

            // Only get the users quizzes
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

            if (!myQuizzes.Any())
            {
                _logger.LogInformation("[QuizController] User {@userId} has no created quizzes.", resolvedUserId);
                return NotFound(new { Message = "You have not created any quizzes yet." });
            }
            return Ok(myQuizzes);
        }

        // GET: api/Quiz/{id}
        // Gets a specific quiz using ID, without anwsers
        [HttpGet("{id}")]
        public async Task<IActionResult> GetQuiz(int id)
        {
            // Eagerly loads questions and their answers for the quiz
            var quiz = await _context.Quizzes
                .Include(q => q.Questions)
                .ThenInclude(q => q.Answers)
                .FirstOrDefaultAsync(q => q.Id == id);

            if (quiz == null)
            {
                return NotFound();
            }

            // Create an anonymous DTO to ensure that 'IsCorrect' is not exposed to the client.
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
        // gets a quiz for editing with all details
        [Authorize]
        [HttpGet("{id}/edit")]
        public async Task<IActionResult> GetQuizForEdit(int id)
        {
            var resolvedUserId = await ResolveUserIdAsync();
            if (resolvedUserId == null)
            {
                return Unauthorized(new { Message = "Could not validate user" });
            }

            // Get the quiz including questions and answers
            var quiz = await _context.Quizzes
                .Include(q => q.Questions)
                .ThenInclude(q => q.Answers)
                .FirstOrDefaultAsync(q => q.Id == id);

            if (quiz == null)
            {
                return NotFound(new { Message = "Quiz not found." });
            }

            if (quiz.UserId != resolvedUserId)
            {
                return StatusCode(403, new { Message = "You do not have permission to edit this quiz." });
            }

            // Returns the full quiz details including correct answers
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
        // Oppdates an existing quiz that the user have created
        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateQuiz(int id, [FromBody] QuizCreationDto quizDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = await ResolveUserIdAsync();
            if (userId == null)
            {
                return Unauthorized(new { Message = "Kunne ikke validere bruker fra token." });
            }

            // Validate the quiz data
            if (quizDto.Questions == null || !quizDto.Questions.Any())
                return BadRequest(new { Message = "Quiz må ha minst ett spørsmål." });
            if (quizDto.Questions.Any(q => q.Answers == null || !q.Answers.Any()))
                return BadRequest(new { Message = "Hvert spørsmål må ha minst ett svar." });

            // Get the existing quiz
            var existingQuiz = await _context.Quizzes
                .Include(q => q.Questions)
                .ThenInclude(q => q.Answers)
                .FirstOrDefaultAsync(q => q.Id == id);

            if (existingQuiz == null)
            {
                return NotFound(new { Message = "Quiz not found." });
            }

            // Check if the user owns the quiz
            if (existingQuiz.UserId != userId)
            {
                return StatusCode(403, new { Message = "You do not have permission to update this quiz." });
            }

            try
            {
                // Update quiz properties
                existingQuiz.Title = quizDto.Title;
                existingQuiz.Description = quizDto.Description;

                // Remove all existing questions and answers
                _context.Questions.RemoveRange(existingQuiz.Questions);

                // Add new questions and answers
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
                return Ok(new { Message = "Quiz updated!", QuizId = existingQuiz.Id });
            }
            catch (DbUpdateException ex)
            {
                //Console.WriteLine($"[QuizController] DbUpdateException: {ex.Message}\nInner: {ex.InnerException?.Message}");
                return StatusCode(500, new { Message = "Update failed (DbUpdateException).", Detail = ex.InnerException?.Message });
            }
            catch (Exception ex)
            {
                //Console.WriteLine($"[QuizController] Unexpected error: {ex}");
                return StatusCode(500, new { Message = "Unexpected error occurred while updating quiz.", Detail = ex.Message });
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
        // sends a quiz submission and calculates the score.
        [HttpPost("submit")]
        public async Task<IActionResult> SubmitQuiz([FromBody] QuizSubmissionDto submissionDto)
        {
            // Eagerly loads the entire quiz structure (questions and answers)
            var quiz = await _context.Quizzes
                .Include(q => q.Questions)
                .ThenInclude(q => q.Answers)
                .FirstOrDefaultAsync(q => q.Id == submissionDto.QuizId);

            if (quiz == null)
            {
                return NotFound("Quiz not found.");
            }

            var totalScore = 0;
            var correctAnswers = 0;
            var questionCount = quiz.Questions.Count;

            foreach (var question in quiz.Questions)
            {
                if (submissionDto.SelectedAnswers.TryGetValue(question.Id, out int selectedAnswerId))
                {
                    // Finds the correct anwser
                    var correctAnswer = question.Answers.FirstOrDefault(a => a.IsCorrect);
                    
                    if (correctAnswer != null && correctAnswer.Id == selectedAnswerId)
                    {
                        totalScore += question.Points;
                        correctAnswers++;
                    }
                }
            }

            // Get user ID from token
            var resolvedUserId = await ResolveUserIdAsync();

            // Save submission to database if user is authenticated
            if (!string.IsNullOrWhiteSpace(resolvedUserId))
            {
                var submission = new QuizSubmission
                {
                    UserId = resolvedUserId,
                    QuizId = quiz.Id,
                    Score = totalScore,
                    MaxScore = quiz.Questions.Sum(q => q.Points),
                    SubmittedAt = DateTime.UtcNow
                };
                _context.QuizSubmissions.Add(submission);
                await _context.SaveChangesAsync();
            }

            return Ok(new
            {
                Score = totalScore,
                CorrectAnswers = correctAnswers,
                TotalQuestions = questionCount
            });
        }

        // GET: api/Quiz/myscores
        // Returns all quiz results for the user 
        [Authorize]
        [HttpGet("myscores")]
        public async Task<IActionResult> GetMyScores()
        {
            var resolvedUserId = await ResolveUserIdAsync();
            if (resolvedUserId == null)
            {
                return Unauthorized(new { Message = "could not validate user." });
            }

            var myScores = await _context.QuizSubmissions
                .Where(s => s.UserId == resolvedUserId)
                .Include(s => s.Quiz)
                .OrderByDescending(s => s.SubmittedAt)
                .Select(s => new
                {
                    QuizTitle = s.Quiz != null ? s.Quiz.Title : "Unknown Quiz",
                    s.Score,
                    s.MaxScore,
                    s.SubmittedAt
                })
                .ToListAsync();

            return Ok(myScores);
        }
    }
}