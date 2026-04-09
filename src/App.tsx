import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lock, CheckCircle2, XCircle, Timer, ArrowRight, RefreshCcw, Coins, Users, Trophy, UserCircle } from "lucide-react";
import { QUESTIONS, Question } from "./types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { db, auth, loginAnonymously } from "./firebase";
import { doc, setDoc, onSnapshot, collection, serverTimestamp, query, orderBy, limit, Timestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

interface PlayerPresence {
  id: string;
  nickname: string;
  coins: number;
  answeredCount: number;
  lastActive: Timestamp;
  isFinished?: boolean;
  finishTime?: Timestamp;
}

export default function App() {
  const [nickname, setNickname] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  const [code, setCode] = useState("");
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  const [penaltyTime, setPenaltyTime] = useState(0);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [coins, setCoins] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [answeredQuestionIds, setAnsweredQuestionIds] = useState<number[]>([]);
  const [players, setPlayers] = useState<PlayerPresence[]>([]);
  const [authError, setAuthError] = useState<string | null>(null);

  const isFinished = answeredQuestionIds.length === QUESTIONS.length;

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  // Presence listener
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "presence"), orderBy("coins", "desc"), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const pList: PlayerPresence[] = [];
      snapshot.forEach((doc) => {
        pList.push({ id: doc.id, ...doc.data() } as PlayerPresence);
      });
      setPlayers(pList);
    });
    return () => unsubscribe();
  }, [user]);

  // Update own presence
  useEffect(() => {
    if (!user || !isJoined) return;
    
    const updatePresence = async () => {
      try {
        await setDoc(doc(db, "presence", user.uid), {
          nickname,
          coins,
          answeredCount: answeredQuestionIds.length,
          lastActive: serverTimestamp(),
          isFinished,
          finishTime: isFinished ? serverTimestamp() : null
        }, { merge: true });
      } catch (err) {
        console.error("Error updating presence:", err);
      }
    };

    const timeout = setTimeout(updatePresence, 500); // Debounce
    return () => clearTimeout(timeout);
  }, [user, isJoined, coins, answeredQuestionIds.length, isFinished, nickname]);

  // Handle penalty countdown
  useEffect(() => {
    if (penaltyTime > 0) {
      const timer = setInterval(() => {
        setPenaltyTime((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [penaltyTime]);

  const handleJoin = async () => {
    if (!nickname.trim()) return;
    setAuthError(null);
    try {
      await loginAnonymously();
      setIsJoined(true);
    } catch (err: any) {
      if (err.code === "auth/admin-restricted-operation") {
        setAuthError("Logowanie anonimowe jest wyłączone w konsoli Firebase. Musisz je włączyć w zakładce Authentication -> Sign-in method.");
      } else {
        setAuthError("Wystąpił błąd podczas dołączania. Spróbuj ponownie.");
      }
      console.error(err);
    }
  };

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
    if (penaltyTime > 0 || isCorrect || !activeQuestion) return;

    const alreadySolved = answeredQuestionIds.includes(activeQuestion.id);

    if (index === activeQuestion.correctIndex) {
      setIsCorrect(true);
      if (!alreadySolved) {
        const earnedCoins = attempts === 0 ? 10 : 6;
        setCoins((prev) => prev + earnedCoins);
        setAnsweredQuestionIds((prev) => [...prev, activeQuestion.id]);
        setFeedback({ type: "success", message: `Poprawna odpowiedź! (+${earnedCoins} monet)` });
      } else {
        setFeedback({ type: "success", message: "Poprawna odpowiedź! (Punkty już wcześniej zdobyte)" });
      }
    } else {
      setPenaltyTime(5);
      setAttempts((prev) => prev + 1);
      if (!alreadySolved) {
        setCoins((prev) => Math.max(0, prev - 2));
        setFeedback({ type: "error", message: "Błędna odpowiedź! (-2 monety, poczekaj 5 sekund)" });
      } else {
        setFeedback({ type: "error", message: "Błędna odpowiedź! Poczekaj 5 sekund." });
      }
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

  const allFinished = useMemo(() => {
    return players.length > 0 && players.every(p => p.isFinished);
  }, [players]);

  if (!isJoined) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex flex-col items-center justify-center p-4 font-sans text-[#1A1A1A]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="border-none shadow-2xl bg-white rounded-[40px] overflow-hidden">
            <CardHeader className="bg-[#1A1A1A] text-white p-10 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-white/10 rounded-full">
                  <UserCircle className="w-12 h-12 text-white" />
                </div>
              </div>
              <CardTitle className="text-3xl font-black tracking-tight uppercase">Witaj w Quizie!</CardTitle>
              <CardDescription className="text-white/60 text-lg">
                Wpisz swój nick, aby dołączyć do gry.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-10 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Twój Nick</label>
                <Input
                  type="text"
                  placeholder="Np. MistrzQuizu"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                  className="h-14 text-xl rounded-2xl border-gray-100 focus:ring-2 focus:ring-[#1A1A1A] transition-all px-6"
                />
              </div>
              
              {authError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-medium"
                >
                  <div className="flex gap-2">
                    <XCircle className="w-5 h-5 shrink-0" />
                    <p>{authError}</p>
                  </div>
                  <p className="mt-2 text-xs opacity-80">
                    Instrukcja: Wejdź do Firebase Console → Authentication → Sign-in method → Włącz "Anonymous".
                  </p>
                </motion.div>
              )}

              <Button
                onClick={handleJoin}
                disabled={!nickname.trim()}
                className="w-full h-14 bg-[#1A1A1A] hover:bg-gray-800 text-white rounded-2xl font-bold text-lg transition-all active:scale-95"
              >
                ROZPOCZNIJ GRĘ
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col items-center justify-center p-4 pt-24 font-sans text-[#1A1A1A] relative overflow-x-hidden">
      {/* Real-time Progress Bar */}
      <div className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-40 p-4 overflow-x-auto">
        <div className="max-w-7xl mx-auto flex items-center gap-6 no-scrollbar">
          <div className="flex items-center gap-2 font-bold text-gray-400 shrink-0">
            <Users className="w-4 h-4" />
            <span className="text-xs uppercase tracking-widest">Gracze:</span>
          </div>
          <div className="flex gap-4">
            {players.map((p) => (
              <div key={p.id} className="flex flex-col gap-1 min-w-[120px]">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter">
                  <span className={p.id === user?.uid ? "text-blue-600" : "text-gray-600"}>
                    {p.nickname} {p.id === user?.uid && "(Ty)"}
                  </span>
                  <span className="text-gray-400">{p.answeredCount}/10</span>
                </div>
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(p.answeredCount / 10) * 100}%` }}
                    className={`h-full rounded-full ${p.isFinished ? "bg-green-500" : "bg-[#1A1A1A]"}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Coins Display */}
      <div className="fixed top-20 right-6 z-30">
        <motion.div 
          key={coins}
          initial={{ scale: 1.2, color: "#EAB308" }}
          animate={{ scale: 1, color: "#1A1A1A" }}
          className="bg-white px-6 py-3 rounded-2xl shadow-xl border border-yellow-100 flex items-center gap-3 font-black text-2xl"
        >
          <Coins className="w-7 h-7 text-yellow-500" />
          <span>{coins}</span>
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        {allFinished ? (
          <motion.div
            key="leaderboard"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-3xl"
          >
            <Card className="border-none shadow-2xl bg-white rounded-[40px] overflow-hidden">
              <CardHeader className="bg-[#1A1A1A] text-white p-12 text-center">
                <div className="flex justify-center mb-6">
                  <Trophy className="w-20 h-20 text-yellow-400" />
                </div>
                <CardTitle className="text-5xl font-black tracking-tighter uppercase mb-2">TOP LISTA</CardTitle>
                <CardDescription className="text-white/60 text-xl font-medium">
                  Wszyscy gracze ukończyli quiz!
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-50">
                  {players.map((p, index) => (
                    <div 
                      key={p.id} 
                      className={`flex items-center justify-between p-8 ${p.id === user?.uid ? "bg-blue-50/50" : ""}`}
                    >
                      <div className="flex items-center gap-6">
                        <span className={`text-3xl font-black ${index < 3 ? "text-yellow-600" : "text-gray-300"}`}>
                          #{index + 1}
                        </span>
                        <div>
                          <div className="text-2xl font-bold text-gray-900">{p.nickname}</div>
                          <div className="text-sm text-gray-400 font-medium">
                            Ukończono: {p.finishTime?.toDate().toLocaleTimeString() || "N/A"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-gray-50 px-6 py-3 rounded-2xl">
                        <Coins className="w-6 h-6 text-yellow-500" />
                        <span className="text-3xl font-black">{p.coins}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="p-10 flex justify-center bg-gray-50">
                <Button 
                  onClick={() => window.location.reload()}
                  className="bg-[#1A1A1A] hover:bg-gray-800 text-white px-12 py-8 text-2xl rounded-3xl font-black transition-all hover:scale-105 shadow-xl"
                >
                  ZAGRAJ PONOWNIE
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ) : !activeQuestion ? (
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
                  Wprowadź kod, aby odblokować pytanie. ({answeredQuestionIds.length}/10)
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
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-medium">
                      {activeQuestion.difficulty}
                    </Badge>
                    {answeredQuestionIds.includes(activeQuestion.id) && (
                      <Badge className="bg-green-100 text-green-700 border-none px-3 py-1 rounded-full font-medium">
                        Rozwiązane
                      </Badge>
                    )}
                  </div>
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
                    <div className="flex items-center gap-2 text-green-600 font-bold text-xl text-center">
                      <CheckCircle2 className="w-6 h-6 shrink-0" />
                      {answeredQuestionIds.includes(activeQuestion.id) && feedback?.message.includes("zdobyt") 
                        ? "Poprawna odpowiedź!" 
                        : "Świetnie! To poprawna odpowiedź."}
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
