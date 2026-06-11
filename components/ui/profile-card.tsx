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
    <div className="w-full mx-auto bg-white dark:bg-[#1a1f24] rounded-t-xl overflow-hidden shadow-sm">
      {/* Red Header Area */}
      <div className="bg-[#e22328] w-full px-6 py-8 md:px-12 md:py-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        
        {/* Left Side: Avatar and Info */}
        <div className="flex items-center gap-6">
          {/* Avatar Image */}
          <div className="w-28 h-28 md:w-36 md:h-36 shrink-0 bg-white shadow-md overflow-hidden">
            <img 
              src={avatarUrl} 
              alt={name} 
              className="w-full h-full object-cover" 
            />
          </div>
          
          {/* Text Info */}
          <div className="text-white flex flex-col gap-1">
            <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tight">{name}</h1>
            <div className="flex items-center gap-8 mt-1 text-sm font-medium">
              <div className="flex flex-col">
                <span>Bengaluru</span>
                <span>(Bangalore)</span>
              </div>
              <span className="text-white/90">514 Views</span>
            </div>
            
            {/* Divider line */}
            <div className="w-full border-t border-dashed border-white/30 my-3"></div>
            
            <p className="text-sm font-medium">
              {battingStyle} <span className="mx-1 text-white/60">|</span> {bowlingStyle}
            </p>
          </div>
        </div>

        {/* Right Side: Stat Blocks */}
        <div className="flex gap-2 md:gap-4 mt-6 md:mt-0">
          <div className="bg-[#b31b1f] hover:bg-[#a0181c] transition-colors rounded-xl px-4 py-5 md:px-6 md:py-6 flex flex-col items-center justify-center gap-1 cursor-pointer shadow-sm min-w-[85px] md:min-w-[110px]">
            <span className="text-white text-2xl md:text-3xl font-bold">{matches}</span>
            <span className="text-white/70 font-medium text-[10px] md:text-xs uppercase tracking-wider">Matches</span>
          </div>
          <div className="bg-[#b31b1f] hover:bg-[#a0181c] transition-colors rounded-xl px-4 py-5 md:px-6 md:py-6 flex flex-col items-center justify-center gap-1 cursor-pointer shadow-sm min-w-[85px] md:min-w-[110px]">
            <span className="text-white text-2xl md:text-3xl font-bold">{runs}</span>
            <span className="text-white/70 font-medium text-[10px] md:text-xs uppercase tracking-wider">Runs</span>
          </div>
          <div className="bg-[#b31b1f] hover:bg-[#a0181c] transition-colors rounded-xl px-4 py-5 md:px-6 md:py-6 flex flex-col items-center justify-center gap-1 cursor-pointer shadow-sm min-w-[85px] md:min-w-[110px]">
            <span className="text-white text-2xl md:text-3xl font-bold">{wickets}</span>
            <span className="text-white/70 font-medium text-[10px] md:text-xs uppercase tracking-wider">Wickets</span>
          </div>
        </div>

      </div>
    </div>
  )
}
