import React, { useState, useMemo } from "react";
import glossary from "./data/glossary.json";

function QuestionCard({
	card,
	cardData,
	showAnswer,
	setShowAnswer,
	setScore,
	onNextQuestion,
	questionType,
	updateUserData,
	isLastQuestion,
}) {
	const [selectedAnswer, setSelectedAnswer] = useState(null);
	const [showExplanation, setShowExplanation] = useState(false);

	const correctAnswer =
		questionType === "meaning"
			? card.upright_meaning
			: card.reversed_meaning;

	const options = useMemo(
		() => generateOptions(card, correctAnswer, questionType, cardData),
		[card, correctAnswer, questionType, cardData]
	);

	const handleSubmit = () => {
		if (selectedAnswer === correctAnswer) {
			setScore((prevScore) => prevScore + 1);
			updateUserData(card.id, true);
		} else {
			updateUserData(card.id, false);
		}
		setShowAnswer(true);
	};

	const questionText =
		questionType === "meaning"
			? "What is the meaning of this card?"
			: "What does this card represent when reversed?";

	const elementDescription = glossary.elements[card.element];
	const signDescription = glossary.astrological_signs[card.associated_sign];

	return (
		<div className='bg-white shadow-lg rounded-lg p-6 w-full max-w-md transform transition-transform'>
			{showExplanation ? (
				<div className='flex flex-col items-center text-center'>
					<h2 className='text-xl font-semibold mb-4'>
						Learn About {card.name}
					</h2>
					<p className='mb-2'>
						<strong>Upright Meaning:</strong> {card.upright_meaning}
					</p>
					<p className='mb-2'>
						<strong>Reversed Meaning:</strong>{" "}
						{card.reversed_meaning}
					</p>
					<p className='mb-2'>
						<strong>Keywords:</strong> {card.keywords.join(", ")}
					</p>
					<p className='mb-2'>
						<strong>Associated Element:</strong> {card.element}
						<span className='text-sm text-gray-600 block mt-1'>
							{elementDescription}
						</span>
					</p>
					{card.associated_sign && ( // Conditional rendering for associated sign
						<p className='mb-2'>
							<strong>Associated Sign:</strong>{" "}
							{card.associated_sign}
							<span className='text-sm text-gray-600 block mt-1'>
								{signDescription}
							</span>
						</p>
					)}
					<button
						onClick={() => setShowExplanation(false)}
						className='mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg'
					>
						Back to Quiz
					</button>
				</div>
			) : (
				<div className='flex flex-col items-center text-center'>
					<img
						src={card.image}
						alt={card.name}
						className={`w-32 h-auto mx-auto mb-4 ${
							questionType === "reversed_meaning"
								? "transform rotate-180"
								: ""
						}`}
					/>
					<h2 className='text-xl font-semibold text-center mb-4'>
						{questionText}
					</h2>
					<div className='grid gap-4'>
						{options.map((option, index) => (
							<button
								key={index}
								onClick={() => setSelectedAnswer(option)}
								className={`py-2 px-4 border rounded-lg ${
									showAnswer && option === correctAnswer
										? "bg-green-500 text-white"
										: selectedAnswer === option
										? "bg-gray-200"
										: "bg-gray-100"
								}`}
								disabled={showAnswer}
							>
								{option}
							</button>
						))}
					</div>
					<div className='mt-4 text-center'>
						{!showAnswer ? (
							<button
								onClick={handleSubmit}
								disabled={selectedAnswer === null}
								className={`mt-4 px-4 py-2 rounded-lg ${
									selectedAnswer === null
										? "bg-gray-400 cursor-not-allowed"
										: "bg-blue-500 text-white"
								}`}
							>
								Lock It In!
							</button>
						) : (
							<>
								<p className='mt-4'>
									{selectedAnswer === correctAnswer
										? "Correct!"
										: `Incorrect. The correct answer is ${correctAnswer}.`}
								</p>
								<button
									onClick={onNextQuestion}
									className='mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg'
								>
									{isLastQuestion
										? "Complete Quiz"
										: "Next Question"}
								</button>
							</>
						)}
					</div>
					<button
						onClick={() => setShowExplanation(true)}
						className='mt-4 bg-yellow-500 text-white px-4 py-2 rounded-lg'
					>
						Learn More
					</button>
				</div>
			)}
		</div>
	);
}

// Helper function to generate multiple-choice options
function generateOptions(correctCard, correctAnswer, questionType, cardData) {
	const options = [correctAnswer];
	while (options.length < 4) {
		const randomCard =
			cardData[Math.floor(Math.random() * cardData.length)];
		const option =
			questionType === "meaning"
				? randomCard.upright_meaning
				: randomCard.reversed_meaning;
		if (!options.includes(option)) {
			options.push(option);
		}
	}
	return options.sort(() => Math.random() - 0.5);
}

export default QuestionCard;
