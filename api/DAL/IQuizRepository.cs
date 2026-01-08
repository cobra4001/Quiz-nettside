using api.Models;
using api.DTOs;

namespace api.DAL;

public interface IQuizRepository
{
    Task<Quiz> CreateQuiz(QuizCreationDto quizDto, string userId);
    Task<List<Quiz>> GetQuizzes();
    Task<List<Quiz>> GetMyQuizzes(string userId);
    Task<Quiz?> GetQuizById(int id);
    Task<Quiz?> GetQuizForEdit(int id, string userId);
    Task<Quiz?> UpdateQuiz(int id, QuizCreationDto quizDto, string userId);
    Task<bool> DeleteQuiz(int id);
    Task<Quiz?> GetQuizForSubmission(int id);
    Task<QuizSubmission> SaveQuizSubmission(QuizSubmission submission);
    Task<List<QuizSubmission>> GetMySubmissions(string userId);
}