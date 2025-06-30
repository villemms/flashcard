import React, { useState, useEffect } from "react";
import "./Flashcard.css";

interface Question {
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
}

interface Flashcard {
  id: number;
  title: string;
  description: string;
  slides: number;
  favorite: boolean;
  questions: Question[];
}

interface PracticeStats {
  totalPoints: number;
  questionsAnswered: number;
  correctAnswers: number;
}

const Flashcard: React.FC = () => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>(() => {
    const saved = localStorage.getItem("flashcards");
    return saved ? JSON.parse(saved) : [];
  });
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [currentCard, setCurrentCard] = useState<Flashcard | null>(null);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [newDifficulty, setNewDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [error, setError] = useState("");
  const [practiceStats, setPracticeStats] = useState<PracticeStats>({
    totalPoints: 0,
    questionsAnswered: 0,
    correctAnswers: 0
  });
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);

  // Save to localStorage whenever flashcards change
  useEffect(() => {
    localStorage.setItem("flashcards", JSON.stringify(flashcards));
  }, [flashcards]);

  const getDifficultyPoints = (difficulty: 'easy' | 'medium' | 'hard'): number => {
    switch (difficulty) {
      case 'easy': return 1;
      case 'medium': return 3;
      case 'hard': return 5;
      default: return 3;
    }
  };

  const addFlashcard = () => {
    if (!title.trim()) {
      setError("Title cannot be empty");
      return;
    }

    if (flashcards.some(card => card.title === title)) {
      setError("A flashcard with this title already exists");
      return;
    }

    setError("");
    const newFlashcard: Flashcard = {
      id: Date.now(),
      title,
      description,
      slides: 0,
      favorite: false,
      questions: [],
    };
    setFlashcards([...flashcards, newFlashcard]);
    setTitle("");
    setDescription("");
  };

  const deleteFlashcard = (id: number) => {
    setFlashcards(flashcards.filter(card => card.id !== id));
    if (currentCard?.id === id) {
      setCurrentCard(null);
      setIsEditing(false);
      setIsPracticeMode(false);
    }
  };

  const toggleFavorite = (id: number) => {
    setFlashcards(
      flashcards.map(card =>
        card.id === id ? { ...card, favorite: !card.favorite } : card
      )
    );
  };

  const selectFlashcard = (id: number) => {
    const card = flashcards.find(card => card.id === id) || null;
    setCurrentCard(card);
    setIsEditing(true);
    setIsPracticeMode(false);
  };

  const addQuestion = () => {
    if (!currentCard) return;

    if (!newQuestion.trim() || !newAnswer.trim()) {
      setError("Question and answer cannot be empty");
      return;
    }

    setError("");
    const points = getDifficultyPoints(newDifficulty);
    const updatedCard = {
      ...currentCard,
      questions: [
        ...currentCard.questions,
        { 
          question: newQuestion, 
          answer: newAnswer, 
          difficulty: newDifficulty,
          points: points
        },
      ],
      slides: currentCard.questions.length + 1,
    };

    setFlashcards(
      flashcards.map(card => (card.id === currentCard.id ? updatedCard : card))
    );
    setCurrentCard(updatedCard);
    setNewQuestion("");
    setNewAnswer("");
    setNewDifficulty('medium');
  };

  const updateQuestion = (index: number, updatedQuestion: Partial<Question>) => {
    if (!currentCard) return;

    const updatedQuestions = [...currentCard.questions];
    updatedQuestions[index] = { 
      ...updatedQuestions[index], 
      ...updatedQuestion,
      points: updatedQuestion.difficulty ? getDifficultyPoints(updatedQuestion.difficulty) : updatedQuestions[index].points
    };

    const updatedCard = {
      ...currentCard,
      questions: updatedQuestions,
    };

    setFlashcards(
      flashcards.map(card => (card.id === currentCard.id ? updatedCard : card))
    );
    setCurrentCard(updatedCard);
  };

  const deleteQuestion = (index: number) => {
    if (!currentCard) return;

    const updatedQuestions = [...currentCard.questions];
    updatedQuestions.splice(index, 1);

    const updatedCard = {
      ...currentCard,
      questions: updatedQuestions,
      slides: updatedQuestions.length,
    };

    setFlashcards(
      flashcards.map(card => (card.id === currentCard.id ? updatedCard : card))
    );
    setCurrentCard(updatedCard);
  };

  const startPractice = () => {
    if (currentCard && currentCard.questions.length > 0) {
      setIsPracticeMode(true);
      setIsEditing(false);
      setCurrentQuestionIndex(0);
      setShowAnswer(false);
      setPracticeStats({
        totalPoints: 0,
        questionsAnswered: 0,
        correctAnswers: 0
      });
    } else {
      setError("No questions available for practice");
    }
  };

  const markAnswer = (correct: boolean) => {
    if (!currentCard || !currentCard.questions[currentQuestionIndex]) return;

    const currentQuestion = currentCard.questions[currentQuestionIndex];
    const pointsEarned = correct ? currentQuestion.points : 0;

    setPracticeStats(prev => ({
      totalPoints: prev.totalPoints + pointsEarned,
      questionsAnswered: prev.questionsAnswered + 1,
      correctAnswers: prev.correctAnswers + (correct ? 1 : 0)
    }));

    // Auto-advance to next question after marking (with delay for user feedback)
    setTimeout(() => {
      if (currentQuestionIndex < currentCard.questions.length - 1) {
        nextQuestion();
      }
    }, 1500);
  };

  const nextQuestion = () => {
    if (currentCard && currentQuestionIndex < currentCard.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowAnswer(false);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setShowAnswer(false);
    }
  };

  const shuffleQuestions = () => {
    if (currentCard) {
      const shuffled = [...currentCard.questions].sort(() => Math.random() - 0.5);
      const updatedCard = { ...currentCard, questions: shuffled };
      setFlashcards(
        flashcards.map(card => (card.id === currentCard.id ? updatedCard : card))
      );
      setCurrentCard(updatedCard);
      setCurrentQuestionIndex(0);
      setShowAnswer(false);
    }
  };

  const resetPractice = () => {
    setCurrentQuestionIndex(0);
    setShowAnswer(false);
    setPracticeStats({
      totalPoints: 0,
      questionsAnswered: 0,
      correctAnswers: 0
    });
  };

  return (
    <div className="flashcard-container">
      <div className="sidebar">
        <h2>FLASHCARDS</h2>
        <div className="flashcard-list">
          {flashcards.map((card) => (
            <div key={card.id} className="flashcard-item-container">
              <button
                className={`flashcard-item ${card.favorite ? "favorite" : ""}`}
                onClick={() => selectFlashcard(card.id)}
              >
                {card.title}
                <span className="question-count">{card.questions.length} Qs</span>
              </button>
              <div className="flashcard-item-actions">
                <button
                  className="favorite-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(card.id);
                  }}
                >
                  {card.favorite ? "★" : "☆"}
                </button>
                <button
                  className="delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteFlashcard(card.id);
                  }}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flashcard-content">
        {error && <div className="error-message">{error}</div>}

        <h1>{!isPracticeMode && !isEditing ? "CREATE FLASHCARD" : currentCard?.title}</h1>
        
        <div className="button-group">
          {currentCard && (
            <>
              <button onClick={startPractice} className="btn">
                PRACTICE
              </button>
              <button onClick={() => setIsEditing(true)} className="btn">
                EDIT
              </button>
              {isPracticeMode && (
                <button onClick={shuffleQuestions} className="btn">
                  SHUFFLE
                </button>
              )}
            </>
          )}
          <button
            onClick={() => {
              setCurrentCard(null);
              setIsEditing(false);
              setIsPracticeMode(false);
              setError("");
            }}
            className="btn"
          >
            EXIT
          </button>
        </div>

        {!isPracticeMode && !isEditing ? (
          <div className="flashcard-form">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
            />
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
            />
            <button className="btn" onClick={addFlashcard}>
              Add Flashcard
            </button>
          </div>
        ) : isEditing ? (
          <div className="flashcard-edit">
            <h2>Editing: {currentCard?.title}</h2>
            <div className="edit-section">
              <input
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="New Question"
              />
              <input
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                placeholder="Answer"
              />
              <select
                value={newDifficulty}
                onChange={(e) => setNewDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                className="difficulty-select"
              >
                <option value="easy">Easy (1 point)</option>
                <option value="medium">Medium (3 points)</option>
                <option value="hard">Hard (5 points)</option>
              </select>
              <button className="btn" onClick={addQuestion}>
                Add Question
              </button>
            </div>

            <div className="questions-list">
              <h3>Questions ({currentCard?.questions.length})</h3>
              {currentCard?.questions.map((q, index) => (
                <div key={index} className="question-item">
                  <div className="question-text">
                    {editingQuestionIndex === index ? (
                      <div className="question-edit-form">
                        <input
                          value={q.question}
                          onChange={(e) => updateQuestion(index, { question: e.target.value })}
                          className="edit-input"
                        />
                        <input
                          value={q.answer}
                          onChange={(e) => updateQuestion(index, { answer: e.target.value })}
                          className="edit-input"
                        />
                        <select
                          value={q.difficulty}
                          onChange={(e) => updateQuestion(index, { difficulty: e.target.value as 'easy' | 'medium' | 'hard' })}
                          className="edit-select"
                        >
                          <option value="easy">Easy (1 point)</option>
                          <option value="medium">Medium (3 points)</option>
                          <option value="hard">Hard (5 points)</option>
                        </select>
                        <button
                          onClick={() => setEditingQuestionIndex(null)}
                          className="save-btn"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="difficulty-badge-container">
                          <span className={`difficulty-badge difficulty-${q.difficulty}`}>
                            {q.difficulty.toUpperCase()} ({q.points}pts)
                          </span>
                        </div>
                        <strong>Q:</strong> {q.question}
                        <br />
                        <strong>A:</strong> {q.answer}
                      </>
                    )}
                  </div>
                  <div className="question-actions">
                    <button
                      onClick={() => setEditingQuestionIndex(editingQuestionIndex === index ? null : index)}
                      className="edit-btn"
                    >
                      {editingQuestionIndex === index ? 'Cancel' : 'Edit'}
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => deleteQuestion(index)}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flashcard-practice">
            <div className="practice-stats">
              <div className="stats-left">
                <div className="progress-indicator">
                  Question {currentQuestionIndex + 1} of {currentCard?.questions.length}
                </div>
                <div className="current-question-info">
                  {currentCard?.questions[currentQuestionIndex] && (
                    <span className={`difficulty-badge difficulty-${currentCard.questions[currentQuestionIndex].difficulty}`}>
                      {currentCard.questions[currentQuestionIndex].difficulty.toUpperCase()} ({currentCard.questions[currentQuestionIndex].points}pts)
                    </span>
                  )}
                </div>
              </div>
              <div className="stats-right">
                <div className="score-display">
                  Score: {practiceStats.totalPoints} points
                </div>
                <div className="accuracy-display">
                  Accuracy: {practiceStats.questionsAnswered > 0 ? Math.round((practiceStats.correctAnswers / practiceStats.questionsAnswered) * 100) : 0}%
                </div>
              </div>
            </div>

            <div className="flashcard-box">
              <p className="flashcard-question">
                {currentCard?.questions[currentQuestionIndex]?.question}
              </p>
              {showAnswer && (
                <>
                  <p className="flashcard-answer">
                    {currentCard?.questions[currentQuestionIndex]?.answer}
                  </p>
                  <div className="answer-buttons">
                    <button
                      className="btn correct-btn"
                      onClick={() => markAnswer(true)}
                    >
                      Correct (+{currentCard?.questions[currentQuestionIndex]?.points}pts)
                    </button>
                    <button
                      className="btn incorrect-btn"
                      onClick={() => markAnswer(false)}
                    >
                      Incorrect (0pts)
                    </button>
                  </div>
                </>
              )}
              {!showAnswer && (
                <button
                  className="btn"
                  onClick={() => setShowAnswer(true)}
                >
                  Show Answer
                </button>
              )}
            </div>

            <div className="navigation-buttons">
              <button
                className="btn"
                onClick={prevQuestion}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </button>
              <button
                className="btn"
                onClick={nextQuestion}
                disabled={
                  !currentCard ||
                  currentQuestionIndex === currentCard.questions.length - 1
                }
              >
                Next
              </button>
            </div>
            <button className="btn" onClick={resetPractice}>
              Restart Practice
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Flashcard;
