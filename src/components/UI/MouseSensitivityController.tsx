interface MouseSensitivityControllerProps {
  mouseSpeed: number;
  onChange: (value: number) => void;
}

const MouseSensitivityController: React.FC<MouseSensitivityControllerProps> = ({
  mouseSpeed,
  onChange,
}) => {
  return (
    <div className="fixed top-0 right-10 mr-8 flex flex-col items-center p-4 rounded text-white">
      <div className="font-bold mb-2">마우스 감도</div>
      <input
        type="range"
        min={0.001}
        max={0.03}
        step={0.001}
        value={mouseSpeed}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-32"
      />
      <div className="mt-2">{mouseSpeed.toFixed(3)}</div>
    </div>
  );
};

export default MouseSensitivityController;
