import { useState } from 'react';
import { useVoiceRecorder } from '../hooks/useVoiceRecorder';
import api from '../services/api';

/**
 * Voice Order Input Component
 * Records Tamil/Hindi/English speech and extracts order details using AI
 */
function VoiceOrderInput({ onOrderExtracted, onError }) {
  const [language, setLanguage] = useState('ta-IN');
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedOrder, setExtractedOrder] = useState(null);
  
  const {
    isListening,
    transcript,
    error: voiceError,
    isSupported,
    startListening,
    stopListening,
    clearTranscript
  } = useVoiceRecorder(language);

  const languages = [
    { code: 'ta-IN', label: 'தமிழ் (Tamil)' },
    { code: 'hi-IN', label: 'हिंदी (Hindi)' },
    { code: 'en-IN', label: 'English (India)' }
  ];

  const handleExtractOrder = async () => {
    if (!transcript.trim()) {
      onError?.('No speech recorded. Please try again.');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await api.post('/ai/voice-order', { text: transcript });
      
      if (response.data.success) {
        setExtractedOrder(response.data.data);
        onOrderExtracted?.(response.data.data);
      } else {
        onError?.(response.data.error || 'Failed to extract order');
      }
    } catch (err) {
      onError?.(err.response?.data?.error || 'Failed to process voice order');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    clearTranscript();
    setExtractedOrder(null);
  };

  if (!isSupported) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">
          Voice recording is not supported in this browser. 
          Please use Chrome or Edge for voice features.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Voice Order Entry</h3>
      
      {/* Language Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Language
        </label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          disabled={isListening}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>

      {/* Voice Recording Button */}
      <div className="flex justify-center mb-4">
        <button
          onClick={isListening ? stopListening : startListening}
          disabled={isProcessing}
          className={`
            w-20 h-20 rounded-full flex items-center justify-center
            transition-all duration-200 shadow-lg
            ${isListening 
              ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
              : 'bg-blue-500 hover:bg-blue-600'
            }
            ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {isListening ? (
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="1" />
            </svg>
          ) : (
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
          )}
        </button>
      </div>

      <p className="text-center text-sm text-gray-500 mb-4">
        {isListening ? 'Listening... Tap to stop' : 'Tap to start recording'}
      </p>

      {/* Voice Error */}
      {voiceError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700 text-sm">{voiceError}</p>
        </div>
      )}

      {/* Transcript Display */}
      {transcript && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Recorded Speech
          </label>
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
            <p className="text-gray-800">{transcript}</p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {transcript && !extractedOrder && (
        <div className="flex gap-2">
          <button
            onClick={handleExtractOrder}
            disabled={isProcessing}
            className="flex-1 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
          >
            {isProcessing ? 'Processing...' : 'Extract Order Details'}
          </button>
          <button
            onClick={handleReset}
            disabled={isProcessing}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50"
          >
            Clear
          </button>
        </div>
      )}

      {/* Extracted Order Display */}
      {extractedOrder && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <h4 className="font-medium text-green-800 mb-2">Extracted Order Details</h4>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Customer:</span> {extractedOrder.customer || 'Not detected'}</p>
            <p><span className="font-medium">Product:</span> {extractedOrder.product || 'Not detected'}</p>
            <p><span className="font-medium">Delivery:</span> {extractedOrder.deliveryDate || 'Not specified'}</p>
            <p><span className="font-medium">Quantity:</span> {extractedOrder.quantity || 1}</p>
          </div>
          <button
            onClick={handleReset}
            className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 w-full"
          >
            Record New Order
          </button>
        </div>
      )}

      {/* Example */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-sm text-blue-800">
          <strong>Example (Tamil):</strong> "பிரியாவுக்கு ப்ளவுஸ் ஆர்டர் வெள்ளிக்கிழமை"
        </p>
        <p className="text-xs text-blue-600 mt-1">
          (Priya's blouse order for Friday)
        </p>
      </div>
    </div>
  );
}

export default VoiceOrderInput;
