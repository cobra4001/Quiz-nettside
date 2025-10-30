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
            else{
                _logger.LogWarning("[QuizController] Could not resolve user ID from token claims.");
                return null;
            }
                
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
            if(!quizzes.Any())
            {
                _logger.LogInformation("[QuizController] No quizzes found in database.");
                return NotFound(new { Message = "No quizzes available." });
            }
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
            // USIKKER PÅ OM LOGGING GIVER  MENING HER???
           /* if (!myQuizzes.Any()) 
                _logger.LogInformation("[QuizController] User {@userId} has no created quizzes.", resolvedUserId); */
                
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
                _logger.LogWarning("[QuizController] Quiz with ID {@quizId} not found.", id);
                return NotFound(new { Message = "Quiz not found for the QuizID" });
            }

            // Create an anonymous DTO to ensure that 'IsCorrect' is not exposed to the client.
            return Ok(new
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
            });

            //return Ok(quizDetails);
        }

        // GET: api/Quiz/{id}/edit
        // gets a quiz for editing with all details
        [Authorize]
        [HttpGet("{id}/edit")]
        public async Task<IActionResult> GetQuizForEdit(int id)
        {
            var userId = await ResolveUserIdAsync();
            if (userId == null)
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
                _logger.LogWarning("[QuizController] Quiz with ID {@quizId} not found for editing.", id);   
                return NotFound(new { Message = "Quiz not found." });
            }
            if (quiz.UserId != userId)
            {
                _logger.LogWarning("[QuizController] User {@userId} attempted to edit quiz {@quizId} without permission.", userId, id);
                return StatusCode(403, new { Message = "You do not have permission to edit this quiz." });
            }
                

            // Return the quiz directly with questions and answers (including IsCorrect)
            return Ok(new
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
            });
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
                return Unauthorized(new { Message = "could not validate user" });
            }

            // Validate the quiz data
            if (quizDto.Questions == null || !quizDto.Questions.Any())
            {
                _logger.LogWarning("[QuizController] UpdateQuiz failed");
                return BadRequest(new { Message = "Quiz må ha minst ett spørsmål." });
            }

            if (quizDto.Questions.Any(q => q.Answers == null || !q.Answers.Any()))
            {
                _logger.LogWarning("[QuizController] UpdateQuiz failed");
                return BadRequest(new { Message = "Hvert spørsmål må ha minst ett svar." });
            }


            // Get the existing quiz
            var existingQuiz = await _context.Quizzes
                .Include(q => q.Questions)
                .ThenInclude(q => q.Answers)
                .FirstOrDefaultAsync(q => q.Id == id);

            if (existingQuiz == null)
            {
                _logger.LogWarning("[QuizController] Quiz with ID {@quizId} not found", id);
                return NotFound(new { Message = "Quiz not found." });
            }
            // Check if the user owns the quiz
            if (existingQuiz.UserId != userId)
            {
                _logger.LogWarning("[QuizController] User {@userId} attempted to update quiz {@quizId} without permission.", userId, id);
                return StatusCode(403, new { Message = "You do not have permission to update this quiz." });
            }


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

            if (await _context.SaveChangesAsync() > 0)
                return Ok(new { Message = "Quiz updated!", QuizId = existingQuiz.Id });

            _logger.LogError("[QuizController] Failed to update quiz {@quizId} for user {@userId}", id, userId);
            return StatusCode(500, new { Message = "Failed to update quiz." });
        }

        //Method for deleting a quiz by id
        // EVENTUELT TRY CATCH BLOCK HER?
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteQuiz(int id)
        {
            // Find the quiz including its questions and answers (for cascade delete) Then remove it, and return 204 
            var quiz = await _context.Quizzes
            .Include(q => q.Questions)
            .ThenInclude(q => q.Answers)
            .FirstOrDefaultAsync(q => q.Id == id);

            if (quiz != null)
            {
                _context.Quizzes.Remove(quiz);
                await _context.SaveChangesAsync();
                return NoContent();
            }
            // If quiz not found, log and return 500
            _logger.LogError("[QuizController] Unexpected error occurred while deleting quiz {@quizId}", id);
            return StatusCode(500, new { Message = "Unexpected error occurred while deleting quiz."});
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
                _logger.LogWarning("[QuizController] Quiz with ID {@quizId} not found for submission.", submissionDto.QuizId);
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
            var userId = await ResolveUserIdAsync();

            // Save submission to database if user is authenticated
            if (!string.IsNullOrWhiteSpace(userId))
            {
                try
                {


                    var submission = new QuizSubmission
                    {
                        UserId = userId,
                        QuizId = quiz.Id,
                        Score = totalScore,
                        MaxScore = quiz.Questions.Sum(q => q.Points),
                        SubmittedAt = DateTime.UtcNow
                    };
                    _context.QuizSubmissions.Add(submission);
                    await _context.SaveChangesAsync();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "[QuizController] Failed to save quiz submission for user {@userId} on quiz {@quizId}", userId, quiz.Id);
                    // Proceed without failing the submission response
                }
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

           try
            {
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
            catch (Exception ex)
            {
                _logger.LogError(ex, "[QuizController] Failed to retrieve scores for user {@userId}", resolvedUserId);
                return StatusCode(500, new { Message = "Failed to retrieve quiz scores." });
            }
        }
    }
}