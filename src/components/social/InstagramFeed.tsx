import React, { useState, useEffect } from "react";
import { Play, ExternalLink } from "lucide-react";
import { Instagram } from "../common/InstagramIcon";
import { socialService } from "../../services";
import { InstagramFeed as IFeed } from "../../types";
import { BRAND } from "../../constants";
import "./InstagramFeed.css";

export const InstagramFeed: React.FC = () => {
  const [feed, setFeed] = useState<IFeed | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    socialService.getInstagramFeed()
      .then(res => setFeed(res))
      .catch(() => setFeed(null))
      .finally(() => setLoading(false));
  }, []);

  if (!loading && (!feed || feed.showOnHome === false || !feed.posts || feed.posts.length === 0)) {
    return null;
  }

  const posts = (feed?.posts || []).slice(0, 6);

  return (
    <section className="gf-social-section">
      <div className="gf-social-container">
        <div className="gf-social-header">
          <span className="gf-social-sub">Follow The Glow</span>
          <h2 className="gf-social-title">JOIN OUR RADIANT COMMUNITY</h2>
          <a
            href={feed?.profileUrl || BRAND.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            className="gf-social-handle-btn"
          >
            <Instagram size={17} />
            <span>{feed?.handle || BRAND.instagram.handle}</span>
            <ExternalLink size={13} />
          </a>
        </div>

        {loading ? (
          <div className="gf-social-grid">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="gf-social-skeleton" />
            ))}
          </div>
        ) : (
          <div className="gf-social-grid">
            {posts.map(post => (
              <a
                key={post.id}
                href={post.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="gf-social-card"
                aria-label={post.caption || "View Glow Face Instagram post"}
              >
                <div className="gf-social-thumb-wrap">
                  <img
                    src={post.mediaUrl}
                    alt={post.caption || "Glow Face Botanical Skincare Post"}
                    className="gf-social-img"
                    loading="lazy"
                  />
                  {post.mediaType === "VIDEO" && (
                    <div className="gf-reel-badge">
                      <Play size={14} fill="#fff" />
                      <span>Reel</span>
                    </div>
                  )}
                  <div className="gf-social-overlay">
                    <Instagram size={28} color="#fff" />
                    {post.caption && (
                      <p className="gf-social-caption">{post.caption}</p>
                    )}
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};