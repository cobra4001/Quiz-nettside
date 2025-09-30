using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using api.Data;
using api.DTOs;
using api.Models;
using System.Security.Claims;

namespace api.Controllers
{
<<<<<<< HEAD

=======
>>>>>>> 6dbdcf1499f8c0e71bf9ec63a2e29d48f74de17f
    [ApiController]
    [Route("api/[controller]")]
    public class QuizController : ControllerBase
    {
        private readonly AppDbContext _context;

        public QuizController(AppDbContext context)
        {
            _context = context;
        }

        // POST: api/Quiz/create
        // Oppretter en ny quiz. Krever autentisering.
        [Authorize]
        [HttpPost("create")]
        public async Task<IActionResult> CreateQuiz([FromBody] QuizCreationDto quizDto)
        {
            // ClaimTypes.NameIdentifier skal alltid være til stede hvis [Authorize] lykkes,
            // men vi sjekker for sikkerhets skyld.
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var quiz = new Quiz
            {
                Title = quizDto.Title,
                UserId = userId,
                // Mapper DTO-strukturen til Modell-strukturen
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
            // Lagrer quizen og alle relaterte spørsmål og svar
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Quiz opprettet!" });
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
<<<<<<< HEAD

    

=======
>>>>>>> 6dbdcf1499f8c0e71bf9ec63a2e29d48f74de17f
}