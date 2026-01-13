import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Croissant, User, ArrowRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { login } from "@/services/authService";

export default function WaiterLogin() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"username" | "pin">("username");
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  // Step 1: Username validation (simplified, actual validation happens on PIN submit in Django)
  const handleUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      setError("Please enter a username");
      return;
    }

    setStep("pin");
    setError("");
    toast.success(`Welcome ${username}!`, {
      description: "Please enter your PIN",
    });
  };

  // Step 2: PIN validation
  const handlePinChange = async (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      setError("");

      if (newPin.length === 4) {
        try {
          await login(username, newPin);
          toast.success("Login successful!", {
            description: `Welcome back, ${username}!`,
          });
          navigate('/waiter/tables');
        } catch (err: any) {
          setError(err.response?.data?.detail || "Invalid login credentials.");
          setTimeout(() => setPin(""), 500);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
    setError("");
  };

  const handleBackToUsername = () => {
    setStep("username");
    setUsername("");
    setPin("");
    setError("");
  };

  return (
    <div className="min-h-screen gradient-cream flex flex-col">
      {/* Header */}
      <header className="pt-24 pb-10 px-6 text-center">
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-2xl bg-white shadow-warm mb-4 p-1 overflow-hidden">
          <img src="/logos/logo1white.jfif" alt="Ama Bakery Logo" className="h-full w-full object-cover" />
        </div>
        <h1 className="text-3xl font-black tracking-tight text-foreground">Ama Bakery</h1>
        <p className="text-muted-foreground text-sm font-medium">Waiter Login</p>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 flex flex-col items-center justify-center pb-8">
        {step === "username" ? (
          // Step 1: Username Entry
          <div className="card-elevated p-6 w-full max-w-sm animate-slide-up">
            <div className="flex items-center justify-center gap-2 mb-6">
              <User className="h-5 w-5 text-primary" />
              <span className="font-medium">Enter your username</span>
            </div>

            <form onSubmit={handleUsernameSubmit} className="space-y-4">
              <div>
                <Input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError("");
                  }}
                  className="h-12 text-center text-lg"
                  autoFocus
                />
              </div>

              {error && (
                <p className="text-destructive text-sm text-center">{error}</p>
              )}

              <Button
                type="submit"
                className="w-full btn-touch gradient-warm shadow-warm-lg"
              >
                Continue
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Demo users: Rahul, Priya
              </p>
            </form>
          </div>
        ) : (
          // Step 2: PIN Entry
          <div className="card-elevated p-6 w-full max-w-sm animate-slide-up">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Lock className="h-5 w-5 text-primary" />
              <span className="font-medium">Enter your PIN</span>
            </div>

            {username && (
              <p className="text-sm text-muted-foreground text-center mb-6">
                Welcome, {username}
              </p>
            )}

            {/* PIN Dots */}
            <div className="flex justify-center gap-4 mb-6">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-4 w-4 rounded-full transition-all ${i < pin.length
                    ? error ? 'bg-destructive' : 'bg-primary'
                    : 'bg-muted'
                    }`}
                />
              ))}
            </div>

            {error && (
              <p className="text-destructive text-sm text-center mb-4">{error}</p>
            )}

            {/* Number Pad */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, 'del'].map((item, index) => (
                <Button
                  key={index}
                  variant={item === 'del' ? 'outline' : 'secondary'}
                  className="h-14 text-xl font-semibold"
                  disabled={item === null}
                  onClick={() => {
                    if (item === 'del') {
                      handleDelete();
                    } else if (item !== null) {
                      handlePinChange(item.toString());
                    }
                  }}
                >
                  {item === 'del' ? '⌫' : item === null ? '' : item}
                </Button>
              ))}
            </div>

            <Button
              variant="ghost"
              className="w-full"
              onClick={handleBackToUsername}
            >
              ← Change username
            </Button>

            <p className="text-xs text-muted-foreground text-center mt-4">
              Demo PINs: 1234 (Rahul), 2345 (Priya)
            </p>
          </div>
        )}

        <Button
          variant="ghost"
          className="mt-4"
          onClick={() => navigate('/')}
        >
          ← Back to role selection
        </Button>
      </main>
    </div>
  );
}
