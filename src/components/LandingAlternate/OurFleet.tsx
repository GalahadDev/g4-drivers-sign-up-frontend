import { motion } from 'framer-motion';

const FLEET_IMAGES = [
    "https://xhcxkvwrjcnioopultzq.supabase.co/storage/v1/object/public/public-resources/our-fleet/WhatsApp%20Image%202026-01-21%20at%2015.56.01.jpeg",
    "https://xhcxkvwrjcnioopultzq.supabase.co/storage/v1/object/public/public-resources/our-fleet/WhatsApp%20Image%202026-01-21%20at%2015.56.02.jpeg",
    "https://xhcxkvwrjcnioopultzq.supabase.co/storage/v1/object/public/public-resources/our-fleet/WhatsApp%20Image%202026-01-21%20at%2015.56.03.jpeg",
    "https://xhcxkvwrjcnioopultzq.supabase.co/storage/v1/object/public/public-resources/our-fleet/WhatsApp%20Image%202026-01-21%20at%2015.56.04.jpeg",
    "https://xhcxkvwrjcnioopultzq.supabase.co/storage/v1/object/public/public-resources/our-fleet/WhatsApp%20Image%202026-01-21%20at%2015.56.03%20(1).jpeg",
    "https://xhcxkvwrjcnioopultzq.supabase.co/storage/v1/object/public/public-resources/our-fleet/WhatsApp%20Image%202026-01-21%20at%2015.56.03%20(2).jpeg",
];

const MARQUEE_ITEMS = [...FLEET_IMAGES, ...FLEET_IMAGES];

export const OurFleet = () => {
    return (
        <div className="w-full py-8 md:py-16 overflow-hidden relative border border-white/8 bg-neutral-900/30 backdrop-blur-sm rounded-2xl md:rounded-3xl mx-auto my-6 md:my-8 max-w-[95%]">

            <h3 className="text-lg md:text-2xl font-bold text-center text-[#D4AF37] mb-6 md:mb-12 uppercase tracking-[0.25em]">
                Our Exclusive Fleet
            </h3>

            {/* Gradient fade masks */}
            <div className="absolute top-0 left-0 w-8 md:w-28 h-full bg-gradient-to-r from-black/90 to-transparent z-10 pointer-events-none" />
            <div className="absolute top-0 right-0 w-8 md:w-28 h-full bg-gradient-to-l from-black/90 to-transparent z-10 pointer-events-none" />

            <motion.div
                className="flex gap-4 md:gap-8 w-max px-4"
                animate={{ x: ['0%', '-50%'] }}
                transition={{
                    duration: 30,
                    ease: 'linear',
                    repeat: Infinity,
                }}
            >
                {MARQUEE_ITEMS.map((src, idx) => (
                    <div
                        key={idx}
                        className="relative w-44 h-60 md:w-60 md:h-76 overflow-hidden rounded-xl md:rounded-2xl border border-white/8 shadow-xl shrink-0 group bg-neutral-900"
                    >
                        <img
                            src={src}
                            alt="G4 Fleet Vehicle"
                            className="w-full h-full object-cover transition-all duration-700 opacity-80 group-hover:opacity-100 grayscale group-hover:grayscale-0 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 ring-1 ring-inset ring-white/8 rounded-xl md:rounded-2xl pointer-events-none" />
                    </div>
                ))}
            </motion.div>
        </div>
    );
};
