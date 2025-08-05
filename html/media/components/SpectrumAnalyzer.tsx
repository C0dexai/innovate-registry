import React, { useRef, useEffect } from 'react';

interface SpectrumAnalyzerProps {
  analyserNode: AnalyserNode;
  isMuted?: boolean;
}

const SpectrumAnalyzer: React.FC<SpectrumAnalyzerProps> = ({ analyserNode, isMuted = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | undefined>(undefined);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !analyserNode) return;

    const canvasCtx = canvas.getContext('2d');
    if (!canvasCtx) return;

    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const resizeCanvas = () => {
        if(canvas.parentElement) {
            canvas.width = canvas.parentElement.clientWidth;
            canvas.height = canvas.parentElement.clientHeight;
        }
    };
    
    const draw = () => {
      animationFrameId.current = requestAnimationFrame(draw);
      
      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

      if (isMuted) {
          canvasCtx.fillStyle = 'rgba(0, 255, 255, 0.2)';
          const barWidth = (canvas.width / bufferLength) * 1.5;
          let x = 0;
          for (let i = 0; i < bufferLength; i++) {
              canvasCtx.fillRect(x, canvas.height - 1, barWidth, 1);
              x += barWidth + 2;
          }
          return;
      }

      analyserNode.getByteFrequencyData(dataArray);
      
      const barWidth = (canvas.width / bufferLength) * 1.5;
      let x = 0;

      const gradient = canvasCtx.createLinearGradient(0, canvas.height, 0, 0);
      gradient.addColorStop(0, 'rgba(198,40,249,0.8)'); // Neon Purple
      gradient.addColorStop(0.5, 'rgba(255,16,240,0.7)'); // Neon Pink
      gradient.addColorStop(1, 'rgba(0,255,255,0.6)'); // Neon Cyan

      canvasCtx.fillStyle = gradient;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        
        canvasCtx.shadowBlur = 5;
        canvasCtx.shadowColor = 'rgba(0, 255, 255, 0.5)';
        
        canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        
        x += barWidth + 2; // barWidth + gap
      }
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    draw();

    return () => {
      if(animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [analyserNode, isMuted]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};

export default SpectrumAnalyzer;