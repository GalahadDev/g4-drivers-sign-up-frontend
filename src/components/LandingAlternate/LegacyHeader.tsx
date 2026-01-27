import { useNavigate } from 'react-router-dom';
import { User, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LegacyHeaderProps {
    session: any;
    userRole: string;
    handleSignOut: () => void;
}

export const LegacyHeader = ({ session, userRole, handleSignOut }: LegacyHeaderProps) => {
    const navigate = useNavigate();

    return (
        <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/5 font-sans transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-14 md:h-16">
                    {/* Logo (Gold Brand) */}
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
                        <img
                            src="https://xhcxkvwrjcnioopultzq.supabase.co/storage/v1/object/public/public-resources/logos/G4_GOLD_brand.webp"
                            alt="G4 Fleet"
                            className="h-8 md:h-9 w-auto object-contain"
                        />
                    </div>

                    {/* Auth Actions (Adapted Styles) */}
                    <div className="flex items-center gap-2 md:gap-4">
                        {!session ? (
                            <Button
                                onClick={() => navigate("/login")}
                                className="bg-[#D4AF37] hover:bg-[#B59122] text-black font-semibold border-none rounded-full"
                            >
                                <span className="flex items-center gap-2">
                                    Sign In <User className="w-4 h-4" />
                                </span>
                            </Button>
                        ) : (
                            <>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => navigate("/profile")}
                                    className="flex items-center gap-2 text-gray-300 hover:text-[#D4AF37] hover:bg-white/5"
                                >
                                    <User className="w-4 h-4" />
                                    <span className="hidden md:inline">My Profile</span>
                                </Button>

                                {userRole === 'admin' && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => navigate("/admin")}
                                        className="flex items-center gap-2 text-[#D4AF37] hover:text-[#D4AF37]/80 hover:bg-white/5"
                                    >
                                        <Settings className="w-4 h-4" />
                                        <span className="hidden md:inline">Admin</span>
                                    </Button>
                                )}

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleSignOut}
                                    className="flex items-center gap-2 text-red-400 hover:text-red-300 hover:bg-white/5"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span className="hidden md:inline">Sign Out</span>
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};
