import { Lock } from "lucide-react"

interface ProfileCardProps {
  name?: string
  battingStyle?: string
  bowlingStyle?: string
  avatarUrl?: string
  matches?: number
  runs?: number
  wickets?: number
}

export function ProfileCard({
  name = "Unknown Player",
  battingStyle = "Unknown Batting",
  bowlingStyle = "Unknown Bowling",
  avatarUrl = "/default-avatar.jpg",
  matches = 0,
  runs = 0,
  wickets = 0,
}: ProfileCardProps) {

  return (
    <div className="w-full mx-auto bg-transparent mb-6">
      {/* Red Header Area */}
      <div className="bg-gradient-to-r from-[#d31027] via-[#e22328] to-[#ea384d] rounded-3xl shadow-xl w-full px-6 py-10 md:px-12 md:py-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        
        {/* Abstract pattern overlay for premium feel */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
        
        {/* Left Side: Avatar and Info */}
        <div className="flex items-center gap-6 md:gap-8 z-10">
          {/* Avatar Image */}
          <div className="w-28 h-28 md:w-36 md:h-36 shrink-0 bg-white rounded-full shadow-2xl border-4 border-white/20 p-1 overflow-hidden transition-transform hover:scale-105 duration-300">
            <img 
              src={avatarUrl} 
              alt={name} 
              className="w-full h-full object-cover rounded-full" 
            />
          </div>
          
          {/* Text Info */}
          <div className="text-white flex flex-col gap-1.5">
            <h1 className="text-3xl md:text-5xl font-extrabold uppercase tracking-tight drop-shadow-md">{name}</h1>
            <div className="flex items-center gap-8 mt-1 text-sm md:text-base font-medium text-white/90">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                <span>Bengaluru (Bangalore)</span>
              </div>
            </div>
            
            {/* Divider line */}
            <div className="w-3/4 border-t border-dashed border-white/30 my-3"></div>
            
            <p className="text-sm md:text-base font-semibold tracking-wide bg-black/20 w-fit px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">
              {battingStyle} <span className="mx-2 text-white/50">•</span> {bowlingStyle}
            </p>
          </div>
        </div>

        {/* Right Side: Stat Blocks */}
        <div className="flex gap-3 md:gap-5 mt-6 md:mt-0 z-10">
          <div className="bg-black/15 hover:bg-black/25 backdrop-blur-md border border-white/10 transition-all duration-300 rounded-2xl px-5 py-6 md:px-7 md:py-7 flex flex-col items-center justify-center gap-1.5 cursor-pointer shadow-lg transform hover:-translate-y-1 min-w-[90px] md:min-w-[120px]">
            <span className="text-white text-3xl md:text-4xl font-black drop-shadow-md">{matches}</span>
            <span className="text-white/80 font-bold text-[10px] md:text-xs uppercase tracking-widest">Matches</span>
          </div>
          <div className="bg-black/15 hover:bg-black/25 backdrop-blur-md border border-white/10 transition-all duration-300 rounded-2xl px-5 py-6 md:px-7 md:py-7 flex flex-col items-center justify-center gap-1.5 cursor-pointer shadow-lg transform hover:-translate-y-1 min-w-[90px] md:min-w-[120px]">
            <span className="text-white text-3xl md:text-4xl font-black drop-shadow-md">{runs}</span>
            <span className="text-white/80 font-bold text-[10px] md:text-xs uppercase tracking-widest">Runs</span>
          </div>
          <div className="bg-black/15 hover:bg-black/25 backdrop-blur-md border border-white/10 transition-all duration-300 rounded-2xl px-5 py-6 md:px-7 md:py-7 flex flex-col items-center justify-center gap-1.5 cursor-pointer shadow-lg transform hover:-translate-y-1 min-w-[90px] md:min-w-[120px]">
            <span className="text-white text-3xl md:text-4xl font-black drop-shadow-md">{wickets}</span>
            <span className="text-white/80 font-bold text-[10px] md:text-xs uppercase tracking-widest">Wickets</span>
          </div>
        </div>

      </div>
    </div>
  )
}
