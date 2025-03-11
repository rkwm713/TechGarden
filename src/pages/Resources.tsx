import React from 'react';
import {
  Sprout,
  Sun,
  Cloud,
  Droplets,
  ThermometerSun,
  Bug,
  Flower2,
  Shovel,
  Calendar,
  BookOpen,
  ExternalLink,
  ChevronDown,
  Search
} from 'lucide-react';

interface ResourceSection {
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  category: 'planning' | 'maintenance' | 'knowledge';
}

export default function Resources() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);

  const sections: ResourceSection[] = [
    {
      title: "EAST TEXAS PLANTING CALENDAR",
      icon: <Calendar className="h-8 w-8 text-green-600" />,
      category: 'planning',
      content: (
        <div className="space-y-6">
          <p className="text-base font-neuton text-gray-700 leading-relaxed">
            Our growing season typically runs from late February through November. Here's what to plant each month:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl">
              <h4 className="text-lg font-semibold mb-3 text-emerald-800">SPRING (FEB-APR)</h4>
              <ul className="list-none font-neuton space-y-2 text-sm">
                {['Tomatoes', 'Peppers', 'Beans', 'Corn', 'Cucumbers', 'Squash'].map((item) => (
                  <li key={item} className="flex items-center">
                    <Sprout className="h-3 w-3 mr-2 text-emerald-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-xl">
              <h4 className="text-lg font-semibold mb-3 text-orange-800">SUMMER (MAY-JUL)</h4>
              <ul className="list-none font-neuton space-y-2 text-sm">
                {['Okra', 'Sweet Potatoes', 'Southern Peas', 'Watermelon', 'Cantaloupe'].map((item) => (
                  <li key={item} className="flex items-center">
                    <Sun className="h-3 w-3 mr-2 text-orange-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-amber-50 to-red-50 p-4 rounded-xl">
              <h4 className="text-lg font-semibold mb-3 text-red-800">FALL (AUG-OCT)</h4>
              <ul className="list-none font-neuton space-y-2 text-sm">
                {['Broccoli', 'Cabbage', 'Carrots', 'Lettuce', 'Spinach', 'Onions'].map((item) => (
                  <li key={item} className="flex items-center">
                    <Flower2 className="h-3 w-3 mr-2 text-red-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "SOIL PREPARATION",
      icon: <Shovel className="h-8 w-8 text-amber-700" />,
      category: 'maintenance',
      content: (
        <div className="space-y-4">
          <p className="text-base font-neuton text-gray-700 leading-relaxed">
            East Texas soil typically consists of sandy loam or clay. Here's how to prepare your plot:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-4 rounded-xl">
              <h4 className="text-lg font-semibold mb-3 text-amber-800">PREPARATION STEPS</h4>
              <ol className="list-none font-neuton space-y-3 text-sm">
                {[
                  'Test soil pH (ideal range 6.0-7.0)',
                  'Add organic matter',
                  'Till to 8-12 inches depth',
                  'Level the surface',
                  'Add moisture-retaining mulch'
                ].map((step, index) => (
                  <li key={step} className="flex items-start">
                    <span className="flex items-center justify-center bg-amber-200 text-amber-800 rounded-full w-5 h-5 mr-2 flex-shrink-0 text-xs">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-xl">
              <h4 className="text-lg font-semibold mb-3 text-orange-800">PRO TIPS</h4>
              <ul className="list-none font-neuton space-y-3 text-sm">
                {[
                  'Add compost every season',
                  'Maintain proper drainage',
                  'Test soil annually',
                  'Use cover crops in winter',
                  'Monitor pH levels regularly'
                ].map((tip) => (
                  <li key={tip} className="flex items-center">
                    <span className="flex-shrink-0 text-orange-600 mr-2">✦</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "WEATHER CONSIDERATIONS",
      icon: <ThermometerSun className="h-8 w-8 text-sky-600" />,
      category: 'knowledge',
      content: (
        <div className="space-y-4">
          <p className="text-base font-neuton text-gray-700 leading-relaxed">
            East Texas has a humid subtropical climate with distinct seasonal patterns:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-sky-50 to-blue-50 p-4 rounded-xl">
              <h4 className="text-lg font-semibold mb-3 text-sky-800">TEMPERATURE PATTERNS</h4>
              <ul className="list-none font-neuton space-y-2 text-sm">
                {[
                  'Hot summers (90°F+)',
                  'Mild winters (occasional freezes)',
                  'Long growing season',
                  'Last frost: mid-March',
                  'First frost: mid-November'
                ].map((item) => (
                  <li key={item} className="flex items-center">
                    <ThermometerSun className="h-3 w-3 mr-2 text-sky-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl">
              <h4 className="text-lg font-semibold mb-3 text-blue-800">RAINFALL PATTERNS</h4>
              <ul className="list-none font-neuton space-y-2 text-sm">
                {[
                  'Annual: 40-50 inches',
                  'Spring: wettest season',
                  'Summer: occasional drought',
                  'Regular irrigation needed',
                  'Monitor soil moisture daily'
                ].map((item) => (
                  <li key={item} className="flex items-center">
                    <Cloud className="h-3 w-3 mr-2 text-blue-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "PEST MANAGEMENT",
      icon: <Bug className="h-8 w-8 text-rose-600" />,
      category: 'maintenance',
      content: (
        <div className="space-y-4">
          <p className="text-base font-neuton text-gray-700 leading-relaxed">
            Common East Texas garden pests and organic control methods:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-rose-50 to-pink-50 p-4 rounded-xl">
              <h4 className="text-lg font-semibold mb-3 text-rose-800">COMMON PESTS</h4>
              <ul className="list-none font-neuton space-y-2 text-sm">
                {[
                  'Fire Ants',
                  'Tomato Hornworms',
                  'Squash Bugs',
                  'Aphids',
                  'Japanese Beetles'
                ].map((pest) => (
                  <li key={pest} className="flex items-center">
                    <Bug className="h-3 w-3 mr-2 text-rose-600" />
                    {pest}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-pink-50 to-purple-50 p-4 rounded-xl">
              <h4 className="text-lg font-semibold mb-3 text-purple-800">ORGANIC SOLUTIONS</h4>
              <ul className="list-none font-neuton space-y-2 text-sm">
                {[
                  'Companion planting',
                  'Beneficial insects',
                  'Neem oil spray',
                  'Diatomaceous earth',
                  'Hand picking'
                ].map((solution) => (
                  <li key={solution} className="flex items-center">
                    <Sprout className="h-3 w-3 mr-2 text-purple-600" />
                    {solution}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "WATER MANAGEMENT",
      icon: <Droplets className="h-8 w-8 text-blue-600" />,
      category: 'maintenance',
      content: (
        <div className="space-y-4">
          <p className="text-base font-neuton text-gray-700 leading-relaxed">
            Proper watering is crucial in our hot climate:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl">
              <h4 className="text-lg font-semibold mb-3 text-blue-800">WATERING GUIDELINES</h4>
              <ul className="list-none font-neuton space-y-2 text-sm">
                {[
                  'Water deeply, less frequently',
                  'Water early morning',
                  'Use mulch to retain moisture',
                  'Monitor soil moisture',
                  'Adjust for rainfall'
                ].map((tip) => (
                  <li key={tip} className="flex items-center">
                    <Droplets className="h-3 w-3 mr-2 text-blue-600" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-cyan-50 to-teal-50 p-4 rounded-xl">
              <h4 className="text-lg font-semibold mb-3 text-teal-800">WATERING SCHEDULE</h4>
              <ul className="list-none font-neuton space-y-2 text-sm">
                {[
                  'New plants: daily',
                  'Established plants: 1-2x/week',
                  'During drought: increase frequency',
                  'Reduce in cooler months',
                  'Check moisture before watering'
                ].map((schedule) => (
                  <li key={schedule} className="flex items-center">
                    <Calendar className="h-3 w-3 mr-2 text-teal-600" />
                    {schedule}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "ADDITIONAL RESOURCES",
      icon: <BookOpen className="h-8 w-8 text-violet-600" />,
      category: 'knowledge',
      content: (
        <div className="space-y-4">
          <p className="text-base font-neuton text-gray-700 leading-relaxed">
            Helpful resources for East Texas gardeners:
          </p>
          
          <div className="grid grid-cols-1 gap-3">
            {[
              {
                title: 'Smith County Extension Office',
                url: 'https://smith.agrilife.org',
                description: 'Local gardening expertise and community resources'
              },
              {
                title: 'Texas A&M AgriLife Extension',
                url: 'https://agrilifeextension.tamu.edu',
                description: 'Research-based gardening information'
              },
              {
                title: 'East Texas Gardening',
                url: 'https://easttexasgardening.tamu.edu',
                description: 'Region-specific gardening guides'
              }
            ].map((resource) => (
              <a
                key={resource.url}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-gradient-to-br from-violet-50 to-purple-50 p-4 rounded-xl hover:shadow-md transition-shadow"
              >
                <div className="flex items-start">
                  <ExternalLink className="h-5 w-5 text-violet-600 mr-3 mt-0.5" />
                  <div>
                    <h5 className="text-lg font-semibold text-violet-900 mb-1">{resource.title}</h5>
                    <p className="text-violet-700 font-neuton text-sm">{resource.description}</p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )
    }
  ];

  const filteredSections = sections.filter((section) => {
    const matchesSearch = section.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || section.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">GARDENING RESOURCES</h1>
        <p className="text-lg text-gray-600 font-neuton max-w-2xl mx-auto">
          Your comprehensive guide to successful gardening in East Texas
        </p>
      </div>

      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-techserv-blue focus:border-transparent text-sm"
            />
          </div>
          
          <div className="flex gap-2">
            {['planning', 'maintenance', 'knowledge'].map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                className={`px-4 py-1.5 rounded-full transition-colors text-sm ${
                  selectedCategory === category
                    ? 'bg-techserv-blue text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredSections.map((section, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-gray-50 rounded-lg">
                {section.icon}
              </div>
              <h2 className="text-xl font-semibold">{section.title}</h2>
            </div>
            <div className="font-neuton">
              {section.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}