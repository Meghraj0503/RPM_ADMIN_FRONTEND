import {
  MdRestaurant,
  MdPsychology,
  MdBedtime,
  MdDirectionsRun,
  MdSelfImprovement,
  MdFitnessCenter,
  MdFavorite,
  MdMonitorHeart,
  MdMedicalServices,
  MdMenuBook,
} from "react-icons/md";
import SectionBanner from "./shared/SectionBanner";
import MetricChip from "./shared/MetricChip";
import CategoryDonut from "./shared/CategoryDonut";

const CATEGORY_ICONS = {
  Nutrition: <MdRestaurant size={22} color="#00C9A7" />,
  "Mental Health": <MdPsychology size={22} color="#6C5CE7" />,
  "Mental health": <MdPsychology size={22} color="#6C5CE7" />,
  Sleep: <MdBedtime size={22} color="#2D9EF0" />,
  Movement: <MdDirectionsRun size={22} color="#FFB020" />,
  Spiritual: <MdSelfImprovement size={22} color="#9B59B6" />,
  Fitness: <MdFitnessCenter size={22} color="#E74C3C" />,
  Wellness: <MdFavorite size={22} color="#FF6B6B" />,
  Cardiology: <MdMonitorHeart size={22} color="#FF5C5C" />,
  Diabetes: <MdMedicalServices size={22} color="#27AE60" />,
};

const getCategoryIcon = (cat) =>
  CATEGORY_ICONS[cat] || <MdMenuBook size={22} color="#9CA3AF" />;

export default function EducationHub({ data }) {
  const cats = (data?.by_category || []).map((c) => ({
    label: c.category,
    value: Number(c.published_count),
    bookmarks: Number(c.bookmark_count),
    icon: getCategoryIcon(c.category),
  }));

  const library = data?.library || {};
  const topArticles = data?.top_articles || [];
  const totalBookmarks = Number(data?.total_bookmarks || 0);
  const avgPerUser = data?.avg_articles_per_user || "0";

  return (
    <div>
      <SectionBanner
        color="blue"
        label="Education Hub Engagement"
        sub="Content effectiveness and reading behaviour"
      />
      <div className="grid-education sectionBoddy sectionBoddyPhMet">
        {/* Left: category donuts */}
        <div className="metric-card">
          <div className="card-title">Articles – by category</div>
          <div className="card-subtitle">
            Total bookmarks: {totalBookmarks} · Avg per user: {avgPerUser}
          </div>
          <div className="chip-row chip-row--mb-lg">
            <MetricChip
              label="Total bookmarks"
              value={totalBookmarks}
              color="blue"
            />
            <MetricChip label="Avg per user" value={avgPerUser} color="green" />
            <MetricChip
              label="Published"
              value={Number(library.published || 0)}
              color="blue"
            />
          </div>
          {cats.length === 0 ? (
            <div className="no-data-center">No articles found</div>
          ) : (
            <>
              <div className="donut-row">
                {cats.slice(0, 3).map((c, i) => (
                  <CategoryDonut
                    key={i}
                    value={c.value}
                    label={c.label}
                    icon={c.icon}
                    size={110}
                  />
                ))}
              </div>
              {cats.length > 3 && (
                <div className="donut-row donut-row--centered">
                  {cats.slice(3, 5).map((c, i) => (
                    <CategoryDonut
                      key={i}
                      value={c.value}
                      label={c.label}
                      icon={c.icon}
                      size={110}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Right: library stats + top articles */}
        <div className="metric-card">
          <div className="card-title">
            Content library status &amp; top performing articles
          </div>
          <div className="chip-row chip-row--mb-lg">
            <MetricChip
              label="Published"
              value={Number(library.published || 0)}
              color="green"
            />
            <MetricChip
              label="Draft"
              value={Number(library.draft || 0)}
              color="yellow"
            />
            <MetricChip
              label="Scheduled"
              value={Number(library.scheduled || 0)}
              color="blue"
            />
          </div>
          <div className="card-section-title">
            Top articles (most bookmarked)
          </div>
          {topArticles.length === 0 ? (
            <div className="no-data-text">No published articles yet</div>
          ) : (
            topArticles.map((a, i) => (
              <div key={i} className="article-row">
                <span className="article-icon-wrap">
                  {getCategoryIcon(a.category)}
                </span>
                <span className="article-title">{a.title}</span>
                <span className="article-stat">
                  <MdMenuBook size={14} /> {a.bookmarks} bookmarks
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
