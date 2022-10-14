import React, {useCallback, useEffect, useReducer, useState} from "react";
import "./Timer.css";

interface TimerProps {
	onNewLap: (previousLap: string) => void;
}

interface TimerState {
	currentLapStart: number;
	currentLap: number;
	currentTime: string;
}

enum TimerAction {
	initialize,
	increment,
}

const initialState: TimerState = {
	currentLap: 0,
	currentLapStart: 0,
	currentTime: "0:00"
};

const isSupported = typeof window !== 'undefined' && 'wakeLock' in navigator && navigator.wakeLock.request;

function calculateLap(startLap: number, currentTime: number): string {
	const time = Math.floor((currentTime - startLap) / 1000)
	const seconds = time % 60
	const formatSeconds = seconds < 10 ? `0${seconds}` : seconds
	const minutes = Math.floor(time / 60)
	return `${minutes}:${formatSeconds}`
}

function reducer(state: TimerState, action: TimerAction): TimerState {
	const now = new Date().getTime();
	switch (action) {
		case TimerAction.initialize:
			return {...state, currentLapStart: now, currentLap: now}
		case TimerAction.increment:
			return {...state, currentLap: now, currentTime: calculateLap(state.currentLapStart, now)}
		default:
			throw new Error();
	}
}

function Timer({onNewLap}: TimerProps) {
	const [state, dispatch] = useReducer(reducer, initialState);
	const [wakeLockSentinel, setWakeLockSentinel] = useState<WakeLockSentinel>();
	const [isDestroyed, setIsDestroyed] = useState<boolean>(false);

	useEffect(() => {
		dispatch(TimerAction.initialize)
		const intervalId = setInterval(() => {
			dispatch(TimerAction.increment)
		}, 20)
		return () => clearInterval(intervalId)
	}, [])

	const newLapStart = useCallback(() => {
		onNewLap(state.currentTime)
		dispatch(TimerAction.initialize)
	}, [onNewLap, state.currentTime])

	const onKeyDown = useCallback((event: KeyboardEvent) => {
		if (event.code === 'Space') {
			newLapStart()
		}
	}, [newLapStart])

	useEffect(() => {
		document.addEventListener("keydown", onKeyDown);
		return () => document.removeEventListener("keydown", onKeyDown)
	}, [onKeyDown])

	useCallback(async () => {
		if (isDestroyed) {
			isSupported && (await wakeLockSentinel?.release().then(() => console.log("release")));
		}
	}, [isDestroyed, wakeLockSentinel])

	useEffect(() => {
		const wakeLockAsync = async () => {
			if (isSupported) {
				navigator.wakeLock.request('screen')
					.then(sentinel => {
						setWakeLockSentinel(sentinel)
					})
					.catch(console.log)
			}
		}

		wakeLockAsync().catch(console.log)
		return () => setIsDestroyed(true)
	}, [])

	const onTouch = useCallback((event: Event) => {
		event.preventDefault();
		newLapStart()
	}, [newLapStart])

	useEffect(() => {
		document.addEventListener("touchstart", onTouch)
		return () => document.removeEventListener("touchstart", onTouch)
	});

	return (
		<div className="time">
			{state.currentTime}
		</div>
	);
}

export default Timer;
