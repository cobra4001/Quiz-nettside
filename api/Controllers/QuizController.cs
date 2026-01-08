using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using api.DTOs;
using api.DAL;
using api.Models;
using System.Security.Claims;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class QuizController : ControllerBase
    {
        private readonly ILogger<QuizController> _logger;
        private readonly IQuizRepository _quizRepository;

        public QuizController(ILogger<QuizController> logger, IQuizRepository quizRepository)
        {
            _logger = logger;
            _quizRepository = quizRepository;
        }

        // Helper method to resolve user ID from JWT token claims
        private async Task<string?> ResolveUserIdAsync()
        {
            var userId = await Task.Run(() => User.FindFirstValue(ClaimTypes.NameIdentifier));
            if (userId != null)
                return userId;
            else
            {
                _logger.LogWarning("[QuizController] Could not resolve user ID from token claims.");
                return null;
            }
        }

        private string SanitizeForLog(string input)
        {
            if (string.IsNullOrEmpty(input))
                return string.Empty;
            
            return new string(input
                .Where(c => !char.IsControl(c) || c == ' ')
                .Take(100)
                .ToArray());
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
                return Unauthorized(new { Message = "Could not validate user, try loggin again" });

            // Format validation (questions and answers)
            if (quizDto.Questions == null || !quizDto.Questions.Any())
                return BadRequest(new { Message = "Quiz must have atleast one question." });
            if (quizDto.Questions.Any(q => q.Answers == null || !q.Answers.Any()))
                return BadRequest(new { Message = "every question must have atleast one anwser." });

            try
            {
                var quiz = await _quizRepository.CreateQuiz(quizDto, userId);
                _logger.LogInformation("[QuizController] Quiz created, quizId: {quizId}, userId: {userId}", 
                    quiz.Id, userId);
                return Ok(new { Message = "Quiz opprettet!", QuizId = quiz.Id });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[QuizController] Failed to create quiz for userId: {userId}", userId);
                return StatusCode(500, new { Message = "Internal server error." });
            }
        }

        // GET: api/Quiz
        // Brings a list of all available quizzes
        [HttpGet]
        public async Task<IActionResult> GetQuizzes()
        {
            try
            {
                var quizzes = await _quizRepository.GetQuizzes();

                var quizList = quizzes.Select(q => new
                {
                    q.UserId,
                    q.Id,
                    q.Title,
                    q.Description,
                    QuestionCount = q.Questions.Count,
                    Creator = q.Creator != null ? q.Creator.UserName! : "Unknown"
                }).ToList();

                return Ok(quizList);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[QuizController] Failed to fetch quizzes");
                return StatusCode(500, new { Message = "Failed to fetch quizzes." });
            }
        }

        // GET: api/Quiz/my
        // Get quizzes created by the logged-in user.
        [Authorize]
        [HttpGet("my")]
        public async Task<IActionResult> GetMyQuizzes()
        {
            var resolvedUserId = await ResolveUserIdAsync();
            if (resolvedUserId == null)
                return Unauthorized(new { Message = "could not validate user." });

            try
            {
                var myQuizzes = await _quizRepository.GetMyQuizzes(resolvedUserId);

                var quizList = myQuizzes.Select(q => new
                {
                    q.Id,
                    q.Title,
                    q.Description,
                    QuestionCount = q.Questions.Count,
                    Creator = q.Creator != null ? q.Creator.UserName! : "Unknown"
                }).ToList();

                return Ok(quizList);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[QuizController] Failed to fetch user quizzes for userId: {userId}", resolvedUserId);
                return StatusCode(500, new { Message = "Failed to fetch your quizzes." });
            }
        }

        // GET: api/Quiz/{id}
        // Gets a specific quiz using ID, without answers
        [HttpGet("{id}")]
        public async Task<IActionResult> GetQuiz(int id)
        {
            try
            {
                var quiz = await _quizRepository.GetQuizById(id);

                if (quiz == null)
                {
                    _logger.LogWarning("[QuizController] Quiz not found, quizId: {quizId}", id);
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
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[QuizController] Failed to fetch quiz, quizId: {quizId}", id);
                return StatusCode(500, new { Message = "Failed to fetch quiz." });
            }
        }

        // GET: api/Quiz/{id}/edit
        // gets a quiz for editing with all details
        [Authorize]
        [HttpGet("{id}/edit")]
        public async Task<IActionResult> GetQuizForEdit(int id)
        {
            var userId = await ResolveUserIdAsync();
            if (userId == null)
                return Unauthorized(new { Message = "Could not validate user" });

            try
            {
                var quiz = await _quizRepository.GetQuizForEdit(id, userId);

                if (quiz == null)
                {
                    _logger.LogWarning("[QuizController] Quiz not found for editing or permission denied, quizId: {quizId}, userId: {userId}", 
                        id, userId);
                    return NotFound(new { Message = "Quiz not found or you don't have permission to edit it." });
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
            catch (Exception ex)
            {
                _logger.LogError(ex, "[QuizController] Failed to fetch quiz for editing, quizId: {quizId}, userId: {userId}", 
                    id, userId);
                return StatusCode(500, new { Message = "Failed to fetch quiz for editing." });
            }
        }

        // PUT: api/Quiz/{id}
        // Updates an existing quiz that the user has created
        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateQuiz(int id, [FromBody] QuizCreationDto quizDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = await ResolveUserIdAsync();
            if (userId == null)
                return Unauthorized(new { Message = "could not validate user" });

            // Validate the quiz data
            if (quizDto.Questions == null || !quizDto.Questions.Any())
            {
                _logger.LogWarning("[QuizController] UpdateQuiz failed - no questions, quizId: {quizId}, userId: {userId}", 
                    id, userId);
                return BadRequest(new { Message = "Quiz må ha minst ett spørsmål." });
            }

            if (quizDto.Questions.Any(q => q.Answers == null || !q.Answers.Any()))
            {
                _logger.LogWarning("[QuizController] UpdateQuiz failed - questions without answers, quizId: {quizId}, userId: {userId}", 
                    id, userId);
                return BadRequest(new { Message = "Hvert spørsmål må ha minst ett svar." });
            }

            try
            {
                var updatedQuiz = await _quizRepository.UpdateQuiz(id, quizDto, userId);

                if (updatedQuiz == null)
                {
                    _logger.LogWarning("[QuizController] Quiz not found for update or permission denied, quizId: {quizId}, userId: {userId}", 
                        id, userId);
                    return NotFound(new { Message = "Quiz not found or you don't have permission to update it." });
                }

                _logger.LogInformation("[QuizController] Quiz updated, quizId: {quizId}, userId: {userId}", 
                    updatedQuiz.Id, userId);
                return Ok(new { Message = "Quiz updated!", QuizId = updatedQuiz.Id });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[QuizController] Failed to update quiz, quizId: {quizId}, userId: {userId}", 
                    id, userId);
                return StatusCode(500, new { Message = "Failed to update quiz." });
            }
        }

        // DELETE: api/Quiz/{id}
        // Method for deleting a quiz by id
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteQuiz(int id)
        {
            var userId = await ResolveUserIdAsync();
            if (userId == null)
                return Unauthorized(new { Message = "Could not validate user." });
            
            try
            {
                // Get the quiz to check ownership
                var quiz = await _quizRepository.GetQuizById(id);

                if (quiz == null)
                {
                    _logger.LogWarning("[QuizController] Quiz with ID {@quizId} not found for deletion", id);
                    return NotFound(new { Message = "Quiz not found." });
                }

                // Check if user is admin or the creator
                var userRole = User.FindFirstValue(ClaimTypes.Role);
                bool isAdmin = userRole == "Admin";
                bool isCreator = quiz.UserId == userId;

                if (!isAdmin && !isCreator)
                {
                    _logger.LogWarning("[QuizController] User {@userId} attempted to delete quiz {@quizId} without permission", userId, id);
                    return Forbid();
                }
                var deleted = await _quizRepository.DeleteQuiz(id);

                if (!deleted)
                {
                    _logger.LogError("[QuizController] Quiz not found for deletion, quizId: {quizId}, userId: {userId}", 
                        id, userId);
                    return StatusCode(500, new { Message = "Unexpected error occurred while deleting quiz." });
                }

                _logger.LogInformation("[QuizController] Quiz deleted, quizId: {quizId}, userId: {userId}", 
                    id, userId);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[QuizController] Failed to delete quiz, quizId: {quizId}, userId: {userId}", 
                    id, userId);
                return StatusCode(500, new { Message = "Failed to delete quiz." });
            }
        }

        // POST: api/Quiz/submit
        // sends a quiz submission and calculates the score.
        [HttpPost("submit")]
        public async Task<IActionResult> SubmitQuiz([FromBody] QuizSubmissionDto submissionDto)
        {
            try
            {
                var quiz = await _quizRepository.GetQuizForSubmission(submissionDto.QuizId);

                if (quiz == null)
                {
                    _logger.LogWarning("[QuizController] Quiz not found for submission, quizId: {quizId}", 
                        submissionDto.QuizId);
                    return NotFound("Quiz not found.");
                }

                var totalScore = 0;
                var correctAnswers = 0;
                var questionCount = quiz.Questions.Count;

                foreach (var question in quiz.Questions)
                {
                    if (submissionDto.SelectedAnswers.TryGetValue(question.Id, out int selectedAnswerId))
                    {
                        // Finds the correct answer
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
                            QuestionsSnapshot = JsonSerializer.Serialize(
                                quiz.Questions.Select(q => new
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
                                }).ToList(),
                                new JsonSerializerOptions
                                {
                                    ReferenceHandler = ReferenceHandler.IgnoreCycles
                                }),
                            AnswersSnapshot = JsonSerializer.Serialize(
                                submissionDto.SelectedAnswers,
                                new JsonSerializerOptions
                                {
                                    ReferenceHandler = ReferenceHandler.IgnoreCycles
                                }
                            ),
                            SubmittedAt = DateTime.UtcNow
                        };

                        await _quizRepository.SaveQuizSubmission(submission);
                        _logger.LogInformation("[QuizController] Quiz submission saved, quizId: {quizId}, userId: {userId}, score: {score}", 
                            quiz.Id, userId, totalScore);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "[QuizController] Failed to save quiz submission, userId: {userId}, quizId: {quizId}", 
                            userId, quiz.Id);
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
            catch (Exception ex)
            {
                _logger.LogError(ex, "[QuizController] Failed to submit quiz");
                return StatusCode(500, new { Message = "Failed to submit quiz." });
            }
        }

        // GET: api/Quiz/myscores
        // Returns all quiz results for the user 
        [Authorize]
        [HttpGet("myscores")]
        public async Task<IActionResult> GetMyScores()
        {
            var resolvedUserId = await ResolveUserIdAsync();
            if (resolvedUserId == null)
                return Unauthorized(new { Message = "could not validate user." });

            try
            {
                var submissions = await _quizRepository.GetMySubmissions(resolvedUserId);

                var myScores = submissions.Select(s =>
                {
                    // Parse the snapshots
                    var questionsSnapshot = string.IsNullOrEmpty(s.QuestionsSnapshot)
                        ? new List<QuestionSnapshotDTO>()
                        : JsonSerializer.Deserialize<List<QuestionSnapshotDTO>>(s.QuestionsSnapshot) ?? new List<QuestionSnapshotDTO>();

                    var answersSnapshot = string.IsNullOrEmpty(s.AnswersSnapshot)
                        ? new Dictionary<int, int>()
                        : JsonSerializer.Deserialize<Dictionary<int, int>>(s.AnswersSnapshot) ?? new Dictionary<int, int>();

                    // Build question details
                    var questionDetails = questionsSnapshot.Select(q =>
                    {
                        // Correct answer text from snapshot answers
                        var correctAnswerText = q.Answers.FirstOrDefault(a => a.IsCorrect)?.AnswerText ?? "Unknown";

                        // Selected answer id (if any) from the answers snapshot
                        int? selectedAnswerId = answersSnapshot.ContainsKey(q.Id) ? (int?)answersSnapshot[q.Id] : null;

                        // Resolve user's answer text and correctness
                        string userAnswerText;
                        bool isCorrect = false;
                        if (selectedAnswerId.HasValue)
                        {
                            var userAnswerObj = q.Answers.FirstOrDefault(a => a.Id == selectedAnswerId.Value);
                            userAnswerText = userAnswerObj?.AnswerText ?? "Unknown";
                            isCorrect = userAnswerObj != null && userAnswerObj.IsCorrect;
                        }
                        else
                        {
                            userAnswerText = "Not answered";
                        }

                        return new
                        {
                            QuestionText = q.QuestionText,
                            Points = q.Points,
                            AllAnswers = q.Answers.Select(a => a.AnswerText).ToList(),
                            CorrectAnswer = correctAnswerText,
                            UserAnswer = userAnswerText,
                            IsCorrect = isCorrect
                        };
                    }).ToList();

                    return new
                    {
                        QuizTitle = s.Quiz != null ? s.Quiz.Title : "Unknown Quiz",
                        s.Score,
                        s.MaxScore,
                        s.SubmittedAt,
                        Questions = questionDetails
                    };
                }).ToList();

                return Ok(myScores);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[QuizController] Failed to retrieve scores for userId: {userId}", resolvedUserId);
                return StatusCode(500, new { Message = "Failed to retrieve quiz scores." });
            }
        }
    }
}