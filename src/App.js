import React, { useState, useEffect } from "react";
import cardData from "./data/cards.json";
import QuestionCard from "./QuestionCard";

function App() {
	const [user, setUser] = useState({
		name: "",
		email: "",
		questionCount: 15,
	});
	const [isQuizStarted, setIsQuizStarted] = useState(false);
	const [isQuizComplete, setIsQuizComplete] = useState(false);
	const [shuffledCardData, setShuffledCardData] = useState([]);
	const [currentCardIndex, setCurrentCardIndex] = useState(0);
	const [score, setScore] = useState(0);
	const [showAnswer, setShowAnswer] = useState(false);
	const [questionType, setQuestionType] = useState("meaning");
	const [userData, setUserData] = useState([]);

	const loadUserData = (email) => {
		const data = JSON.parse(localStorage.getItem(email));
		return (
			data ||
			cardData.map((card) => ({
				id: card.id,
				shown: 0,
				correct: 0,
				incorrect: 0,
			}))
		);
	};

	useEffect(() => {
		if (user.email) {
			setUserData(loadUserData(user.email));
			shuffleQuestions();
		}
	}, [user.email]);

	const shuffleQuestions = () => {
		const prioritizedQuestions = prioritizeQuestions(userData);
		setShuffledCardData(prioritizedQuestions.slice(0, user.questionCount));
	};

	const prioritizeQuestions = (userData) => {
		const neverShown = userData.filter((data) => data.shown === 0);
		const shown = userData.filter((data) => data.shown > 0);
		shuffleArray(neverShown);
		shown.sort((a, b) => {
			const ratioA = a.incorrect / (a.correct + 1);
			const ratioB = b.incorrect / (b.correct + 1);
			return ratioB - ratioA;
		});
		shuffleArray(shown);
		const prioritizedCards = [...neverShown, ...shown].map((data) =>
			cardData.find((card) => card.id === data.id)
		);

		return prioritizedCards;
	};

	const shuffleArray = (array) => {
		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
		}
	};

	const handleFormSubmit = (e) => {
		e.preventDefault();
		setIsQuizStarted(true);
	};

	const handleNextQuestion = () => {
		if (currentCardIndex + 1 < user.questionCount) {
			setCurrentCardIndex((prevIndex) => prevIndex + 1);
			setShowAnswer(false);
			setQuestionType(getRandomQuestionType());
		} else {
			setIsQuizComplete(true);
			setIsQuizStarted(false);
		}
	};

	const getRandomQuestionType = () => {
		const questionTypes = ["meaning", "reversed_meaning"];
		return questionTypes[Math.floor(Math.random() * questionTypes.length)];
	};

	const resetQuiz = () => {
		setIsQuizComplete(false);
		setIsQuizStarted(false);
		setScore(0);
		setCurrentCardIndex(0);
	};

	const updateUserData = (cardId, isCorrect) => {
		setUserData((prevUserData) =>
			prevUserData.map((data) => {
				if (data.id === cardId) {
					const updatedData = {
						...data,
						shown: data.shown + 1,
						correct: isCorrect ? data.correct + 1 : data.correct,
						incorrect: isCorrect
							? data.incorrect
							: data.incorrect + 1,
					};
					localStorage.setItem(
						user.email,
						JSON.stringify(prevUserData)
					);
					return updatedData;
				}
				return data;
			})
		);
	};

	if (isQuizComplete) {
		const scorePercentage = ((score / user.questionCount) * 100).toFixed(2);

		return (
			<div className='flex flex-col items-center min-h-screen bg-gray-100 text-gray-800 p-4'>
				<h1 className='text-2xl font-bold mb-6'>
					Congratulations, {user.name}!
				</h1>
				<p className='text-lg font-semibold'>You completed the quiz!</p>
				<p className='text-lg font-semibold'>
					Final Score: {score} out of {user.questionCount}
				</p>
				<p className='text-lg font-semibold'>
					Correct Answers: {scorePercentage}%
				</p>
				<button
					onClick={resetQuiz}
					className='mt-6 bg-blue-500 text-white px-4 py-2 rounded'
				>
					Start New Quiz
				</button>
			</div>
		);
	}

	if (!isQuizStarted) {
		return (
			<div className='flex flex-col items-center mt-8 px-4 py-8 bg-white shadow-lg rounded-lg max-w-md mx-auto'>
				{/* Introductory section */}
				<div className='mb-6 text-center'>
					<h1 className='text-2xl font-bold text-gray-800 mb-2'>
						Welcome to the Tarot Quiz!
					</h1>
					<p className='text-gray-600'>
						This quiz is designed to help you learn and remember
						Tarot card meanings. We ask for your email to track your
						progress and personalize your experience.
					</p>
				</div>

				{/* Form Section */}
				<form className='w-full' onSubmit={handleFormSubmit}>
					<input
						type='text'
						placeholder='First Name'
						className='w-full mb-3 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400'
						value={user.name}
						onChange={(e) =>
							setUser({ ...user, name: e.target.value })
						}
						required
					/>
					<input
						type='email'
						placeholder='Email'
						className='w-full mb-3 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400'
						value={user.email}
						onChange={(e) =>
							setUser({ ...user, email: e.target.value })
						}
						required
					/>
					<select
						className='w-full mb-4 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400'
						value={user.questionCount}
						onChange={(e) =>
							setUser({
								...user,
								questionCount: parseInt(e.target.value),
							})
						}
						required
					>
						<option value={15}>15 Questions</option>
						<option value={35}>35 Questions</option>
						<option value={78}>78 Questions</option>
					</select>
					<button
						type='submit'
						className='w-full bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg transition duration-200 hover:bg-blue-600 focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:outline-none'
					>
						Start Quiz
					</button>
				</form>
			</div>
		);
	}

	const currentCard = shuffledCardData[currentCardIndex];

	return (
		<div className='flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-800 p-4'>
			<h1 className='text-2xl font-bold mb-6'>Tarot Card Quiz</h1>
			<p className='mb-4'>
				Question {currentCardIndex + 1} of {user.questionCount}
			</p>
			{currentCard && (
				<QuestionCard
					card={currentCard}
					cardData={cardData} // Pass cardData here
					showAnswer={showAnswer}
					setShowAnswer={setShowAnswer}
					setScore={setScore}
					onNextQuestion={handleNextQuestion}
					questionType={questionType}
					userData={userData}
					setUserData={setUserData}
					userEmail={user.email}
					isLastQuestion={currentCardIndex + 1 === user.questionCount}
					updateUserData={updateUserData}
				/>
			)}
			<div className='mt-4'>
				<p className='text-lg font-semibold'>Score: {score}</p>
			</div>
		</div>
	);
}

export default App;
