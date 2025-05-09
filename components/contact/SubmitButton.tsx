import React from 'react';

interface SubmitButtonProps {
  title: string;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({ title }) => {
  return (
    <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
      {title}
    </button>
  );
};

export default SubmitButton;