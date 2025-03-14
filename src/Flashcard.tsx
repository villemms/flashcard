import React, { useState } from "react";
import "./Flashcard.css";

interface Flashcard {
  id: number;
  title: string;
  description: string;
  slides: number;
  favorite: boolean;
  questions: { question: string; answer: string }[];
}

const Flashcard: React.FC = () => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [currentCard, setCurrentCard] = useState<Flashcard | null>(null);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const addFlashcard = () => {
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

  const selectFlashcard = (id: number) => {
    setCurrentCard(flashcards.find((card) => card.id === id) || null);
    setIsEditing(true);
  };

  const addQuestion = () => {
    if (currentCard && newQuestion.trim() !== "" && newAnswer.trim() !== "") {
      const updatedCard = {
        ...currentCard,
        questions: [...currentCard.questions, { question: newQuestion, answer: newAnswer }],
        slides: currentCard.questions.length + 1,
      };
      setFlashcards(
        flashcards.map((card) => (card.id === currentCard.id ? updatedCard : card))
      );
      setCurrentCard(updatedCard);
      setNewQuestion("");
      setNewAnswer("");
    }
  };

  const startPractice = () => {
    if (currentCard && currentCard.questions.length > 0) {
      setIsPracticeMode(true);
      setIsEditing(false);
      setCurrentQuestionIndex(0);
      setShowAnswer(false);
    }
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

  return (
    <div className="flashcard-container">
      <div className="sidebar">
        <h2>FLASHCARDS</h2>
        <div className="flashcard-list">
          {flashcards.map((card) => (
            <button key={card.id} className="flashcard-item" onClick={() => selectFlashcard(card.id)}>
              {card.title}
            </button>
          ))}
        </div>
      </div>
      <div className="flashcard-content">
        <h1>CREATE FLASHCARD</h1>
        <div className="button-group">
          <button onClick={startPractice} className="btn">START</button>
          <button onClick={() => setIsEditing(true)} className="btn">EDIT</button>
          <button 
            onClick={() => {
              setCurrentCard(null);
              setIsEditing(false);
              setIsPracticeMode(false);
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
            <button className="btn" onClick={addFlashcard}>Add Flashcard</button>
          </div>
        ) : isEditing ? (
          <div className="flashcard-edit">
            <h2>Editing: {currentCard?.title}</h2>
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
            <button className="btn" onClick={addQuestion}>Add Question</button>
          </div>
        ) : (
          <div className="flashcard-practice">
            <h2>{currentCard?.title}</h2>
            <div className="flashcard-box">
              <p className="flashcard-question">{currentCard?.questions[currentQuestionIndex]?.question}</p>
              {showAnswer && <p className="flashcard-answer">{currentCard?.questions[currentQuestionIndex]?.answer}</p>}
              <button className="btn" onClick={() => setShowAnswer(true)}>Show Answer</button>
            </div>
            <div className="navigation-buttons">
              <button className="btn" onClick={prevQuestion}>Previous</button>
              <button className="btn" onClick={nextQuestion}>Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


export default Flashcard;
