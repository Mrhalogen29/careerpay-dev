import { Search, Bell, Menu, HelpCircle, User, Settings } from "lucide-react"; 
import useNotificationCount from "../../hooks/useNotificationCount";

export default function NewHeader({ toggleSidebar, user, onNavigate }) {
  const unreadCount = useNotificationCount(user?._id);
  return ( 
    <header className="h-20 bg-white border-b border-gray-100 flex items-center px-8 sticky top-0 z-20 w-full"> 
       
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={toggleSidebar} 
          className="lg:hidden p-2.5 rounded-xl text-gray-500 hover:bg-gray-50 transition-all border border-gray-100"
        > 
          <Menu size={20} /> 
        </button> 
   
        {/* Search Bar - More Centered */}
        <div className="relative w-full max-w-md hidden md:block mx-auto"> 
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" /> 
          <input 
            type="text" 
            placeholder="Search dashboard..." 
            className="w-full pl-11 pr-4 py-2.5 text-xs bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/5 transition-all placeholder:text-gray-400 font-bold" 
          /> 
        </div> 
      </div>
 
      {/* Right Actions */}
      <div className="flex items-center gap-2"> 
        <button className="p-2.5 rounded-xl text-gray-400 hover:bg-gray-50 hover:text-blue-600 transition-all relative group"> 
          <HelpCircle size={20} />
        </button>

        <button className="p-2.5 rounded-xl text-gray-400 hover:bg-gray-50 hover:text-blue-600 transition-all relative group"> 
          <Settings size={20} />
        </button>

        <button type="button" onClick={() => onNavigate?.("notification")} aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : "Notifications"} className="p-2.5 rounded-xl text-gray-400 hover:bg-gray-50 hover:text-blue-600 transition-all relative group">
          <Bell size={20} />
          {unreadCount > 0 && <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />}
        </button>

        <div className="h-8 w-px bg-gray-100 mx-3 hidden sm:block"></div>

        <div className="flex items-center gap-3 pl-1 group cursor-pointer">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-sm font-black text-gray-900 leading-none">{user?.firstName || "Adewale"} {user?.lastName || "David"}</span>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1.5">{user?.role || "Founder"}</span>
          </div>
          <div className="relative">
            <img 
              src={`https://ui-avatars.com/api/?name=${user?.firstName || "Adewale"}+${user?.lastName || "David"}&background=1D4EFF&color=fff`} 
              alt="User" 
              className="w-10 h-10 rounded-xl object-cover ring-2 ring-transparent group-hover:ring-blue-500/20 transition-all shadow-sm" 
            />
          </div>
        </div>
      </div> 
    </header> 
  ); 
}
