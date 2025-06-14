import { useState, useEffect, useRef } from 'react';

function App() {
    const [isModelLoading, setIsModelLoading] = useState(true)
    const [showLoadingScreen, setShowLoadingScreen] = useState(true)
    const [model, setModel] = useState(null)
    const [imageURL, setImageURL] = useState(null);
    const [results, setResults] = useState([])
    const [history, setHistory] = useState([])

    const imageRef = useRef()
    const fileInputRef = useRef()
    const cameraInputRef = useRef()

    // Enhanced loading screen
    if (showLoadingScreen || isModelLoading) {
        return (
            <div className="App loading-screen">
                <div className="loading-content">
                    <h1 className='header'>Coral Reef Identification System</h1>
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <h2 className="loading-title">Initializing System</h2>
                        <p className="loading-text">Loading Artificial Neural Network (ANN)...</p>
                        <p className="loading-subtext">Please wait while we prepare the identification system</p>
                    </div>
                </div>
            </div>
        )
    }

    const loadModel = async () => {
        try {
            const modelURL = `${window.location.origin}/coralimagemodel/model.json`;
            const metadataURL = `${window.location.origin}/coralimagemodel/metadata.json`;
            
            if (!window.tmImage) {
                console.error("Teachable Machine library not loaded");
                setIsModelLoading(false);
                return;
            }
            
            const model = await window.tmImage.load(modelURL, metadataURL);
            setModel(model);
            setIsModelLoading(false);
        } catch (error) {
            console.error("Error loading model:", error);
            setIsModelLoading(false);
        }
    }

    useEffect(() => {
        // Ensure loading screen shows for minimum 2 seconds
        const loadingTimer = setTimeout(() => {
            setShowLoadingScreen(false);
        }, 2000);

        loadModel();

        return () => clearTimeout(loadingTimer);
    }, []);

    const identify = async () => {
        if (!model || !imageRef.current) return;
        
        try {
            const predictions = await model.predict(imageRef.current);
            
            // Enhanced prediction processing
            const formattedResults = predictions
                .map(p => ({
                    className: p.className,
                    probability: p.probability
                }))
                .filter(result => result.probability >= 0.0001) // Filter results >= 0.01%
                .sort((a, b) => b.probability - a.probability) // Sort by confidence
                .slice(0, 3); // Keep only top 3 predictions
            
            setResults(formattedResults);
            
            // Update history
            if (imageURL && !history.includes(imageURL)) {
                setHistory([imageURL, ...history]);
            }
        } catch (error) {
            console.error("Error identifying image:", error);
        }
    }

    // ... existing uploadImage, triggerUpload, and triggerCamera functions ...

    return (
        <div className="App">
            <h1 className='header'>Coral Reef Identification System</h1>
            <div className='inputHolder'>
                <input type='file' accept='image/*' className='uploadInput' onChange={uploadImage} ref={fileInputRef} style={{ display: 'none' }} />
                <input type='file' accept='image/*' capture='environment' className='uploadInput' onChange={uploadImage} ref={cameraInputRef} style={{ display: 'none' }} />

                <button className='uploadImage' onClick={triggerUpload}>Upload from Gallery</button>
                <button className='captureImage' onClick={triggerCamera}>Capture Image</button>
            </div>
            <div className="mainWrapper">
                <div className="mainContent">
                    <div className="imageHolder">
                        {imageURL && <img src={imageURL} alt="Upload Preview" crossOrigin="anonymous" ref={imageRef} />}
                    </div>
                    {results.length > 0 && <div className='resultsHolder'>
                        {results.map((result, index) => {
                            const confidence = (result.probability * 100).toFixed(2);
                            const isBestGuess = confidence >= 99;
                            return (
                                <div className={`result ${isBestGuess ? 'best-guess' : ''} ${index === 0 ? 'top-result' : ''}`} key={result.className}>
                                    <span className='name'>{result.className}</span>
                                    <div className='confidence-container'>
                                        <span className='confidence'>Confidence: {confidence}%</span>
                                        {isBestGuess && <span className='best-guess-badge'>Best Guess</span>}
                                        {index === 0 && !isBestGuess && <span className='top-match-badge'>Top Match</span>}
                                    </div>
                                </div>
                            )
                        })}
                    </div>}
                </div>
            </div>
            {history.length > 0 && <div className="recentPredictions">
                <h2>Recent Images</h2>
                <div className="recentImages">
                    {history.map((image, index) => (
                        <div className="recentPrediction" key={`${image}${index}`}>
                            <img src={image} alt='Recent Prediction' onClick={() => setImageURL(image)} />
                        </div>
                    ))}
                </div>
            </div>}
        </div>
    );
}

export default App;