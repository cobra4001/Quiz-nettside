using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ITPE3200.Models;

namespace ITPE3200.Controllers;

public class QuizController : Controller
{
    public IActionResult Table()
    {
        var quizzes = new List<Quiz>
        {
            new Quiz { QuizId = 1, Name = "Math Quiz", CreatedAt = DateTime.Now.AddDays(-10) },
            new Quiz { QuizId = 2, Name = "Science Quiz", CreatedAt = DateTime.Now.AddDays(-5) },
            new Quiz { QuizId = 3, Name = "History Quiz", CreatedAt = DateTime.Now.AddDays(-2) }
        };

        return View(quizzes);
    }
}