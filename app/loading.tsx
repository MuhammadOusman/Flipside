"use client";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-300 via-red-400 to-purple-500">
      <div className="text-center">
        {/* Comic Book Page Flip Animation */}
        <div className="relative w-32 h-32 mx-auto mb-6">
          <div className="absolute inset-0 border-4 border-black bg-white animate-pulse">
            <div className="absolute inset-2 bg-[radial-gradient(circle,_#00000020_1px,_transparent_1px)] bg-[size:10px_10px]" />
          </div>
        </div>
        
        <h2 className="font-heading text-5xl text-white drop-shadow-[3px_3px_0px_rgba(0,0,0,1)] mb-4">
          LOADING...
        </h2>
        
        <div className="flex gap-2 justify-center">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-4 h-4 bg-white border-2 border-black animate-bounce"
              style={{
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
