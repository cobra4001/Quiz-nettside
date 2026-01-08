using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Identity;
using Moq;
using Xunit;

using api.Controllers;
using api.DAL;
using api.Models;
using api.DTOs;

namespace api.Tests.Controllers;

public class AuthControllerTests
{
    private readonly Mock<IAuthRepository> _repo;
    private readonly IConfiguration _config; 
    private readonly Mock<ILogger<AuthController>> _logger;
    private readonly AuthController _controller;

    public AuthControllerTests()
    {
        _repo   = new Mock<IAuthRepository>();
        _config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Key"] = "supersecret_key_1234567890_super_secret_key",
                ["Jwt:Issuer"] = "test-issuer",
                ["Jwt:Audience"] = "test-audience"
            })
            .Build();

        _logger = new Mock<ILogger<AuthController>>();

        
        _controller = new AuthController(_repo.Object, _config, _logger.Object);
    }

    
    private void SetupAuthenticatedUser(string userId = "user123", string username = "alice")
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, userId),
            new Claim(ClaimTypes.Name, username)
        };
        var principal = new ClaimsPrincipal(new ClaimsIdentity(claims, "TestAuth"));

        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = principal }
        };
    }

    private void SetupUnauthenticatedUser()
    {
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = new ClaimsPrincipal() }
        };
    }

    // register (positive)
    [Fact]
    public async Task Register_Ok_WhenEmailIsNew()
    {
        var dto = new RegisterDTO { Username="alice", Email="a@b.com", Phonenumber="12345678", Password="StrongP@ss1", ConfirmPassword="StrongP@ss1" };

        _repo.Setup(r => r.FindUserByEmailAsync("a@b.com")).ReturnsAsync((AuthUser?)null);
        _repo.Setup(r => r.CreateUserAsync(It.IsAny<AuthUser>(), "StrongP@ss1")).ReturnsAsync(IdentityResult.Success);
        _repo.Setup(r => r.AddUserToRoleAsync(It.IsAny<AuthUser>(), "User")).ReturnsAsync(IdentityResult.Success);

        var result = await _controller.Register(dto);

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(ok.Value);

        _repo.Verify(r => r.CreateUserAsync(It.Is<AuthUser>(u => u.UserName=="alice" && u.Email=="a@b.com" && u.PhoneNumber=="12345678"), "StrongP@ss1"), Times.Once);
        _repo.Verify(r => r.AddUserToRoleAsync(It.IsAny<AuthUser>(), "User"), Times.Once);
    }

    // register (negative) 
    [Fact]
    public async Task Register_Conflict_WhenEmailExists()
    {
        var dto = new RegisterDTO { Username="alice", Email="a@b.com", Phonenumber="12345678", Password="StrongP@ss1", ConfirmPassword="StrongP@ss1" };

        _repo.Setup(r => r.FindUserByEmailAsync("a@b.com")).ReturnsAsync(new AuthUser { Email="a@b.com" });

        var result = await _controller.Register(dto);

        var conflict = Assert.IsType<ConflictObjectResult>(result);
        Assert.NotNull(conflict.Value);

        _repo.Verify(r => r.CreateUserAsync(It.IsAny<AuthUser>(), It.IsAny<string>()), Times.Never);
    }

    // login (positive)
    [Fact]
    public async Task Login_Ok_WhenCredentialsValid()
    {
        var dto = new LoginDTO { Username="alice", Password="StrongP@ss1" };
        var user = new AuthUser { Id="user123", UserName="alice", Email="a@b.com" };

        _repo.Setup(r => r.FindUserByUsernameAsync("alice")).ReturnsAsync(user);
        _repo.Setup(r => r.CheckPasswordAsync(It.IsAny<AuthUser>(), "StrongP@ss1")).ReturnsAsync(true);
        _repo.Setup(r => r.GetUserRolesAsync(It.IsAny<AuthUser>())).ReturnsAsync(new List<string>{"User"});

        var result = await _controller.Login(dto);

        if (result is OkObjectResult ok)
        {
            Assert.NotNull(ok.Value);
        }
        else
        {
            var obj = Assert.IsType<ObjectResult>(result);
            // Treat null (default) as 200, otherwise must be 200 explicitly
            var code = obj.StatusCode ?? 200;
            Assert.Equal(200, code);
            Assert.NotNull(obj.Value);
        }
    }

    // login (negative) worng password
    [Fact]
    public async Task Login_Unauthorized_WhenBadPassword()
    {
        var dto = new LoginDTO { Username="alice", Password="wrong" };
        var user = new AuthUser { Id="user123", UserName="alice" };

        _repo.Setup(r => r.FindUserByUsernameAsync("alice")).ReturnsAsync(user);
        _repo.Setup(r => r.CheckPasswordAsync(It.IsAny<AuthUser>(), "wrong")).ReturnsAsync(false);

        var result = await _controller.Login(dto);

        Assert.IsType<UnauthorizedResult>(result);
    }

    // get profile positive
    [Fact]
    public async Task GetProfile_Ok_WhenAuthenticated()
    {
        SetupAuthenticatedUser("user123", "alice");
        var user = new AuthUser { Id="user123", UserName="alice", Email="a@b.com", PhoneNumber="12345678" };

        _repo.Setup(r => r.FindUserByIdAsync("user123")).ReturnsAsync(user);
        _repo.Setup(r => r.GetUserRolesAsync(user)).ReturnsAsync(new List<string>{"User"});

        var result = await _controller.GetProfile();

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(ok.Value);
    }

    // get profile (negative)
    [Fact]
    public async Task GetProfile_Unauthorized_WhenNoUser()
    {
        SetupUnauthenticatedUser();

        var result = await _controller.GetProfile();

        Assert.IsType<UnauthorizedResult>(result);
    }

    //update contact (positive)
    [Fact]
    public async Task UpdateContact_Ok_WhenAuthenticated()
    {
        SetupAuthenticatedUser("user123", "alice");
        var dto = new UpdateContactDTO { Email="new@mail.com", Phonenumber="87654321" };
        var user = new AuthUser { Id="user123", UserName="alice", Email="old@mail.com", PhoneNumber="12345678" };

        _repo.Setup(r => r.FindUserByIdAsync("user123")).ReturnsAsync(user);
        _repo.Setup(r => r.UpdateUserAsync(It.IsAny<AuthUser>())).ReturnsAsync(IdentityResult.Success);

        var result = await _controller.UpdateContact(dto);

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(ok.Value);

        _repo.Verify(r => r.UpdateUserAsync(It.Is<AuthUser>(u => u.Email=="new@mail.com" && u.PhoneNumber=="87654321")), Times.Once);
    }

    // update (negative)
    [Fact]
    public async Task UpdateContact_Unauthorized_WhenNoUser()
    {
        SetupUnauthenticatedUser();
        var dto = new UpdateContactDTO { Email="x@y.com", Phonenumber="12345678" };

        var result = await _controller.UpdateContact(dto);

        Assert.IsType<UnauthorizedResult>(result);
    }

    // change password (positive)
    [Fact]
    public async Task ChangePassword_Ok_WhenCurrentIsValid()
    {
        SetupAuthenticatedUser("user123", "alice");
        var dto = new ChangePasswordDTO { OldPassword="OldP@ss1", NewPassword="NewP@ss2" };
        var user = new AuthUser { Id="user123", UserName="alice" };

        _repo.Setup(r => r.FindUserByIdAsync("user123")).ReturnsAsync(user);
        _repo.Setup(r => r.ChangePasswordAsync(user, "OldP@ss1", "NewP@ss2")).ReturnsAsync(IdentityResult.Success);

        var result = await _controller.ChangePassword(dto);

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(ok.Value);
    }

    // change password (negative)
    [Fact]
    public async Task ChangePassword_BadRequest_WhenCurrentInvalid()
    {
        SetupAuthenticatedUser("user123", "alice");
        var dto = new ChangePasswordDTO { OldPassword="Wrong", NewPassword="NewP@ss2" };
        var user = new AuthUser { Id="user123", UserName="alice" };

        _repo.Setup(r => r.FindUserByIdAsync("user123")).ReturnsAsync(user);
        _repo.Setup(r => r.ChangePasswordAsync(user, "Wrong", "NewP@ss2")).ReturnsAsync(IdentityResult.Failed(new IdentityError { Description="Invalid current password" }));

        var result = await _controller.ChangePassword(dto);

        var bad = Assert.IsType<BadRequestObjectResult>(result);
        Assert.NotNull(bad.Value);
    }
}