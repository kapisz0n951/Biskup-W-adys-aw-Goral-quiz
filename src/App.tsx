import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lock, CheckCircle2, XCircle, Timer, ArrowRight, RefreshCcw, Coins } from "lucide-react";
import { QUESTIONS, Question } from "./types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function App() {
  const [code, setCode] = useState("");
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  const [penaltyTime, setPenaltyTime] = useState(0);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [coins, setCoins] = useState(0);
  const [attempts, setAttempts] = useState(0);

  // Handle penalty countdown
  useEffect(() => {
    if (penaltyTime > 0) {
      const timer = setInterval(() => {
        setPenaltyTime((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [penaltyTime]);

  const handleUnlock = () => {
    const question = QUESTIONS.find((q) => q.code === code.trim());
    if (question) {
      setActiveQuestion(question);
      setFeedback(null);
      setIsCorrect(false);
      setAttempts(0);
    } else {
      setFeedback({ type: "error", message: "Nieprawidłowy kod. Spróbuj ponownie." });
    }
  };

  const handleAnswer = (index: number) => {
    if (penaltyTime > 0 || isCorrect) return;

    if (index === activeQuestion?.correctIndex) {
      setIsCorrect(true);
      const earnedCoins = attempts === 0 ? 10 : 6;
      setCoins((prev) => prev + earnedCoins);
      setFeedback({ type: "success", message: `Poprawna odpowiedź! (+${earnedCoins} monet)` });
    } else {
      setPenaltyTime(5);
      setAttempts((prev) => prev + 1);
      setCoins((prev) => Math.max(0, prev - 2));
      setFeedback({ type: "error", message: "Błędna odpowiedź! (-2 monety, poczekaj 5 sekund)" });
    }
  };

  const nextCode = () => {
    setActiveQuestion(null);
    setCode("");
    setFeedback(null);
    setIsCorrect(false);
    setPenaltyTime(0);
    setAttempts(0);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col items-center justify-center p-4 font-sans text-[#1A1A1A] relative">
      {/* Coins Display */}
      <div className="fixed top-6 right-6 z-50">
        <motion.div 
          key={coins}
          initial={{ scale: 1.2, color: "#EAB308" }}
          animate={{ scale: 1, color: "#1A1A1A" }}
          className="bg-white px-4 py-2 rounded-2xl shadow-lg border border-yellow-100 flex items-center gap-2 font-bold text-xl"
        >
          <Coins className="w-6 h-6 text-yellow-500" />
          <span>{coins}</span>
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        {!activeQuestion ? (
          <motion.div
            key="unlock"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-md"
          >
            <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden">
              <CardHeader className="bg-[#1A1A1A] text-white p-8">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <Lock className="w-5 h-5 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold tracking-tight">Quiz Kodowy</CardTitle>
                </div>
                <CardDescription className="text-white/60">
                  Wprowadź kod, aby odblokować pytanie.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Kod dostępu
                  </label>
                  <Input
                    type="text"
                    placeholder="Wpisz kod tutaj..."
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
                    className="h-12 text-lg rounded-xl border-gray-200 focus:ring-2 focus:ring-[#1A1A1A] transition-all"
                  />
                </div>

                {feedback?.type === "error" && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 text-red-500 text-sm font-medium"
                  >
                    <XCircle className="w-4 h-4" />
                    {feedback.message}
                  </motion.div>
                )}

                <Button
                  onClick={handleUnlock}
                  className="w-full h-12 bg-[#1A1A1A] hover:bg-[#333] text-white rounded-xl font-semibold transition-all group"
                >
                  Odblokuj Pytanie
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="question"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-2xl"
          >
            <Card className="border-none shadow-2xl bg-white rounded-3xl overflow-hidden">
              <CardHeader className="p-8 border-b border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <Badge variant="secondary" className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-medium">
                    {activeQuestion.difficulty}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={nextCode}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <RefreshCcw className="w-4 h-4 mr-2" />
                    Zmień kod
                  </Button>
                </div>
                <CardTitle className="text-2xl font-bold leading-tight text-gray-900">
                  {activeQuestion.text}
                </CardTitle>
              </CardHeader>

              <CardContent className="p-8 space-y-4">
                {activeQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    disabled={penaltyTime > 0 || isCorrect}
                    onClick={() => handleAnswer(index)}
                    className={`
                      w-full p-6 text-left rounded-2xl border-2 transition-all duration-200 flex items-center justify-between group
                      ${
                        isCorrect && index === activeQuestion.correctIndex
                          ? "bg-green-50 border-green-500 text-green-700"
                          : penaltyTime > 0
                          ? "bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white border-gray-100 hover:border-[#1A1A1A] hover:bg-gray-50 text-gray-700"
                      }
                    `}
                  >
                    <span className="text-lg font-medium">{option}</span>
                    {isCorrect && index === activeQuestion.correctIndex && (
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    )}
                  </button>
                ))}
              </CardContent>

              <CardFooter className="p-8 bg-gray-50 flex flex-col gap-4">
                {penaltyTime > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full flex items-center justify-center gap-3 p-4 bg-red-50 text-red-600 rounded-xl font-bold"
                  >
                    <Timer className="w-5 h-5 animate-pulse" />
                    <span>Poczekaj jeszcze {penaltyTime}s</span>
                  </motion.div>
                )}

                {isCorrect && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full flex flex-col items-center gap-4"
                  >
                    <div className="flex items-center gap-2 text-green-600 font-bold text-xl">
                      <CheckCircle2 className="w-6 h-6" />
                      Świetnie! To poprawna odpowiedź.
                    </div>
                    <Button
                      onClick={nextCode}
                      className="w-full bg-[#1A1A1A] hover:bg-[#333] text-white py-8 text-xl rounded-2xl font-bold shadow-lg group"
                    >
                      WPISZ NASTĘPNY KOD
                      <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform" />
                    </Button>
                  </motion.div>
                )}
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
