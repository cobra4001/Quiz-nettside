import React, { useEffect, useRef } from "react";
import { useAuth } from "../../auth/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Trophy } from "lucide-react";

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const hasShownToast = useRef(false);


  useEffect(() => {
  const state = location.state as { message?: string; from?: string };
  
  if (state?.message && !hasShownToast.current) {
    hasShownToast.current = true;
    
    setTimeout(() => {
      toast.info(state.message, {
        duration: 5000,
      });
    }, 100);
    
    window.history.replaceState({}, document.title);
  }
}, [location.state]);

  const features = [
    {
      icon: <Sparkles className="w-8 h-8 text-primary" />,
      title: "Create Custom Quizzes",
      description: "Design engaging quizzes which you can share with friends or other users!"
    },
    {
      icon: <Trophy className="w-8 h-8 text-primary" />,
      title: "Track Progress",
      description: "Monitor your performance, view detailed statistics, and see your progress on every single quiz!"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="text-center max-w-4xl mx-auto space-y-8 my-10 lg:my-0">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-green-700">
            {!user ? "Quiz Hub" : `Welcome back ${user.unique_name}!`}
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Create custom quizzes, challenge your friends, and track your progress!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
            {!user ? (
              <>
                <Button
                  onClick={() => navigate("/LoginPage")}
                  className="w-full sm:w-auto bg-primary hover:bg-primary/80 text-primary-foreground px-8 rounded-xl cursor-pointer"
                  size="lg"
                >
                  Login to Create a Quiz
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => navigate("/quizcreate")}
                  className="w-full sm:w-auto bg-primary hover:bg-primary/80 text-primary-foreground px-8 cursor-pointer"
                  size="lg"
                >
                  Create a Quiz
                </Button>
              </>
            )}
            <Button
                  onClick={() => navigate("/QuizList")}
                  variant="outline"
                  className="w-full sm:w-auto px-8 text-foreground rounded-xl bg-card cursor-pointer"
                  size="lg"
                >
                  Browse Quizzes
                </Button>
          </div>
        </div>
      </div>

      <div className="w-full px-4 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="relative overflow-hidden bg-card/50 backdrop-blur-sm border-2  transition-all duration-300">
                <CardHeader>
                  <div className="mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-2xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;