import React, {useCallback, useState} from 'react';
import './App.css';
import Timer from "./components/Timer";

function App() {
	const [times, setTimes] = useState<string[]>([])
	const newLap = useCallback((currentTime: string) => {
		setTimes([...times, currentTime])
	}, [times])
	return (
		<div>
			<Timer onNewLap={newLap}/>
			<div className="times">
				{times.map((time, index) => (
					<div
						key={index}
					>
						Lap {index + 1}: {time}
					</div>
				))}
			</div>
		</div>
	);
}

export default App;
