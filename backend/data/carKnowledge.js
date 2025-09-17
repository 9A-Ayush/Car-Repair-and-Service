// Car knowledge base for chatbot
export const carKnowledge = {
    "brakes": {
        "keywords": ["brake", "braking", "stop", "pedal", "squeaking", "grinding"],
        "description": "Brakes are a critical safety component that require regular maintenance. Common issues include squeaking, grinding, soft pedal feel, or vibration when braking.",
        "tips": [
            "Have your brakes inspected every 10,000-15,000 miles",
            "Replace brake fluid every 2 years",
            "If you hear squealing or grinding, get your brakes checked immediately"
        ],
        "warnings": [
            "Driving with worn brake pads can damage rotors and increase repair costs",
            "Completely worn brakes can lead to brake failure and accidents"
        ],
        "estimatedCost": "$150-$500 depending on the vehicle and required parts",
        "recommendedAction": "Schedule a brake inspection if you notice any unusual sounds or feel when braking"
    },
    "engine": {
        "keywords": ["engine", "motor", "power", "stalling", "check engine", "light", "overheating"],
        "description": "The engine is the heart of your vehicle. Common issues include overheating, unusual noises, stalling, or the check engine light coming on.",
        "tips": [
            "Change oil and filter regularly (typically every 5,000-7,500 miles)",
            "Replace air filters as recommended",
            "Don't ignore the check engine light"
        ],
        "warnings": [
            "Continuing to drive with an overheating engine can cause severe damage",
            "Ignoring unusual engine noises can lead to complete engine failure"
        ],
        "estimatedCost": "$100-$1,500+ depending on the issue",
        "recommendedAction": "If your check engine light is on or you notice unusual engine behavior, schedule a diagnostic service"
    },
    "transmission": {
        "keywords": ["transmission", "gear", "shifting", "automatic", "manual", "clutch", "slipping"],
        "description": "The transmission transfers power from the engine to the wheels. Problems may include difficulty shifting, slipping gears, or fluid leaks.",
        "tips": [
            "Check transmission fluid level and condition regularly",
            "Have transmission fluid changed according to manufacturer recommendations",
            "Don't shift between drive and reverse while the vehicle is moving"
        ],
        "warnings": [
            "Transmission repairs are typically expensive",
            "Ignoring early warning signs can lead to complete transmission failure"
        ],
        "estimatedCost": "$300-$4,000+ depending on the issue and if replacement is needed",
        "recommendedAction": "Schedule a transmission service if you notice jerking, delayed engagement, or fluid leaks"
    },
    "battery": {
        "keywords": ["battery", "starting", "electrical", "dead", "jump start", "alternator"],
        "description": "The battery provides electrical power to start your vehicle and run accessories. Common issues include difficulty starting, electrical problems, or complete battery failure.",
        "tips": [
            "Most batteries last 3-5 years",
            "Keep battery terminals clean and tight",
            "If jump starting is needed, follow proper procedures"
        ],
        "warnings": [
            "Extreme temperatures can reduce battery life",
            "A failing alternator can damage a new battery"
        ],
        "estimatedCost": "$100-$300 for battery replacement",
        "recommendedAction": "Have your battery and charging system tested if you experience starting problems"
    },
    "tires": {
        "keywords": ["tire", "wheel", "flat", "pressure", "tread", "alignment", "rotation"],
        "description": "Tires are your only contact with the road. Issues include improper inflation, uneven wear, alignment problems, or punctures.",
        "tips": [
            "Check tire pressure monthly",
            "Rotate tires every 5,000-7,000 miles",
            "Check tread depth regularly (insert a penny in the tread - if you can see all of Lincoln's head, it's time for new tires)"
        ],
        "warnings": [
            "Driving on worn tires increases stopping distance and risk of hydroplaning",
            "Improper inflation affects handling, fuel economy, and tire life"
        ],
        "estimatedCost": "$400-$1,000+ for a set of four tires",
        "recommendedAction": "Schedule tire rotation, balance, and alignment service every 6-12 months"
    },
    "oil": {
        "keywords": ["oil", "change", "synthetic", "conventional", "leak", "level", "pressure"],
        "description": "Engine oil lubricates and protects your engine. Common issues include low oil level, leaks, or degraded oil quality.",
        "tips": [
            "Check oil level monthly",
            "Change oil every 3,000-7,500 miles (conventional) or 7,500-15,000 miles (synthetic)",
            "Address oil leaks promptly"
        ],
        "warnings": [
            "Running an engine with low oil can cause catastrophic damage",
            "Using the wrong oil type can affect engine performance and longevity"
        ],
        "estimatedCost": "$30-$75 for an oil change service",
        "recommendedAction": "Schedule regular oil changes according to your vehicle manufacturer's recommendations"
    },
    "cooling": {
        "keywords": ["coolant", "radiator", "overheating", "temperature", "thermostat", "water pump", "hose"],
        "description": "The cooling system prevents your engine from overheating. Problems include coolant leaks, thermostat failure, or water pump issues.",
        "tips": [
            "Check coolant level regularly",
            "Flush cooling system every 30,000-50,000 miles",
            "Address any leaks immediately"
        ],
        "warnings": [
            "Never open the radiator cap when the engine is hot",
            "Continuing to drive an overheating vehicle can cause severe engine damage"
        ],
        "estimatedCost": "$100-$500 depending on the issue",
        "recommendedAction": "If your temperature gauge reads high or you see coolant leaks, schedule a cooling system inspection"
    },
    "suspension": {
        "keywords": ["suspension", "shock", "strut", "spring", "ride", "bumpy", "steering", "alignment"],
        "description": "The suspension system provides a smooth ride and keeps tires in contact with the road. Issues include rough ride, uneven tire wear, or handling problems.",
        "tips": [
            "Have suspension components inspected during regular maintenance",
            "Address unusual noises (clunks, squeaks) promptly",
            "Replace shocks/struts every 50,000-100,000 miles"
        ],
        "warnings": [
            "Worn suspension components can affect vehicle control and safety",
            "Bad alignment can cause premature tire wear"
        ],
        "estimatedCost": "$200-$1,500 depending on components needed",
        "recommendedAction": "Schedule a suspension inspection if you notice a rough ride, pulling to one side, or uneven tire wear"
    },
    "maintenance": {
        "keywords": ["maintenance", "service", "schedule", "interval", "regular", "preventive"],
        "description": "Regular maintenance keeps your vehicle running reliably and can prevent costly repairs. This includes oil changes, filter replacements, and inspections.",
        "tips": [
            "Follow your vehicle's recommended maintenance schedule",
            "Keep records of all services performed",
            "Address small issues before they become major problems"
        ],
        "warnings": [
            "Skipping maintenance can void warranties",
            "Deferred maintenance often leads to more expensive repairs later"
        ],
        "estimatedCost": "$150-$300 for typical scheduled maintenance service",
        "recommendedAction": "Consult your owner's manual for the recommended maintenance schedule and keep up with regular service intervals"
    }
};