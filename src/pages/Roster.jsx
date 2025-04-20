// src/pages/Roster.jsx
import rosterData from '../data/i4l_roster_page_2025-04-20.json';

const getBorderColorClass = (colorTheme) => {
  return `border-${colorTheme}`;
};

export default function Roster() {
  // Group members by roster name
  const grouped = rosterData.reduce((acc, idol) => {
    acc[idol.roster] = acc[idol.roster] || [];
    acc[idol.roster].push(idol);
    return acc;
  }, {});

  return (
    <main className="p-4 sm:p-6 md:p-8 bg-gray-50 min-h-screen space-y-10">
      {Object.entries(grouped).map(([rosterName, members]) => (
        <section key={rosterName}>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
            {rosterName}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.map(({ member, role, bio, image_url, color_theme }) => {
              const borderColorClass = getBorderColorClass(color_theme);
              return (
                <div
                  key={member}
                  className={`rounded-xl p-4 shadow-md bg-white border-2 ${borderColorClass}`}
                >
                  <img
                    src={image_url}
                    alt={member}
                    className="w-full h-60 object-cover rounded-md mb-4"
                  />
                  <h3 className="text-xl font-semibold text-gray-900">{member}</h3>
                  <p className="text-sm text-gray-600 italic">{role}</p>
                  <p className="text-sm text-gray-800 mt-2">{bio}</p>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </main>
  );
}
