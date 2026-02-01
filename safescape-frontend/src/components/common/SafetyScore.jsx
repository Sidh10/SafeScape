import React from 'react';
import './SafetyScore.css';

function SafetyScore({ score }) {
  const getSafetyColor = () => {
    if (score >= 80) return 'green';
    if (score >= 60) return 'yellow';
    if (score >= 40) return 'orange';
    return 'red';
  };

  return (
    <div className="safety-score" style={{ borderColor: getSafetyColor() }}>
      <h3>Route Safety Score</h3>
      <div className="score-display" style={{ color: getSafetyColor() }}>
        {score}/100
      </div>
      <p>{score >= 80 ? 'Very Safe' : score >= 60 ? 'Moderately Safe' : 'Caution Advised'}</p>
    </div>
  );
}

export default SafetyScore;
