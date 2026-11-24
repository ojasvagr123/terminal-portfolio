import Image from "next/image";
import {
  ArrowUpRight,
  Award,
  BriefcaseBusiness,
  Code2,
  Download,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { portfolio } from "@/data/portfolio";

const navItems = [
  ["Work", "#work"],
  ["Experience", "#experience"],
  ["About", "#about"],
  ["Contact", "#contact"],
] as const;

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="section-heading">
      <p className="eyebrow">{eyebrow}</p>
      <div>
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
    </div>
  );
}

export default function Home() {
  const { profile } = portfolio;

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Ojasv Agrawal, home">
          <span>{profile.shortName}</span>
          <strong>{profile.name}</strong>
        </a>
        <nav aria-label="Primary navigation">
          {navItems.map(([label, href]) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
        </nav>
        <a className="header-cta" href={`mailto:${profile.email}`}>
          Let&apos;s talk
        </a>
      </header>

      <section className="hero" id="top">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-copy">
          <p className="availability">
            <span /> Available for software engineering opportunities
          </p>
          <p className="hero-eyebrow">{profile.eyebrow}</p>
          <h1>{profile.headline}</h1>
          <p className="hero-intro">{profile.intro}</p>
          <div className="hero-actions">
            <a className="button button-primary" href="#work">
              Explore my work <ArrowUpRight size={18} />
            </a>
            <a className="button button-secondary" href={profile.resume} target="_blank">
              <Download size={18} /> Download résumé
            </a>
          </div>
          <div className="hero-socials" aria-label="Social profiles">
            <a href={profile.github} target="_blank" rel="noreferrer">
              <Code2 size={18} /> GitHub
            </a>
            <a href={profile.linkedin} target="_blank" rel="noreferrer">
              <BriefcaseBusiness size={18} /> LinkedIn
            </a>
            <span>
              <MapPin size={18} /> {profile.location}
            </span>
          </div>
        </div>

        <div className="portrait-wrap">
          <div className="portrait-frame">
            <Image
              src={profile.photo}
              alt="Ojasv Agrawal"
              fill
              priority
              sizes="(max-width: 900px) 82vw, 38vw"
            />
          </div>
          <div className="portrait-note">
            <Code2 size={18} />
            <span>
              <strong>Developer + problem solver</strong>
              Building from Indore, India
            </span>
          </div>
        </div>
      </section>

      <section className="metrics" aria-label="Quick facts">
        {portfolio.metrics.map((metric) => (
          <div key={metric.label}>
            <strong>{metric.value}</strong>
            <span>{metric.label}</span>
          </div>
        ))}
      </section>

      <section className="section projects-section" id="work">
        <SectionHeading
          eyebrow="Selected work"
          title="Products with real depth, not just polished screens."
          description="A selection of deployed projects spanning competitive programming, cybersecurity, education and applied machine learning."
        />

        <div className="projects-list">
          {portfolio.projects.map((project, index) => (
            <article className={`project project-${project.theme}`} key={project.title}>
              <div className="project-content">
                <div className="project-number">0{index + 1}</div>
                <p className="project-eyebrow">{project.eyebrow}</p>
                <h3>{project.title}</h3>
                <p className="project-description">{project.description}</p>
                <ul className="tag-list" aria-label={`${project.title} technologies`}>
                  {project.stack.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <div className="project-links">
                  <a href={project.demo} target="_blank" rel="noreferrer">
                    View live project <ArrowUpRight size={17} />
                  </a>
                  <a href={project.github} target="_blank" rel="noreferrer">
                    <Code2 size={17} /> Source code
                  </a>
                </div>
              </div>
              <a
                className="project-visual"
                href={project.demo}
                target="_blank"
                rel="noreferrer"
                aria-label={`Open ${project.title} live project`}
              >
                <Image
                  src={project.image}
                  alt={`${project.title} product interface`}
                  fill
                  sizes="(max-width: 900px) 100vw, 58vw"
                />
                <span>
                  Live product <ArrowUpRight size={16} />
                </span>
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="section experience-section" id="experience">
        <SectionHeading
          eyebrow="Experience"
          title="Engineering across industry, research and government."
          description="I have worked on financial infrastructure, explainable AI and production web systems - learning to move between deep technical detail and user impact."
        />
        <div className="timeline">
          {portfolio.experience.map((item, index) => (
            <article className="timeline-item" key={`${item.company}-${item.period}`}>
              <div className="timeline-index">0{index + 1}</div>
              <div className="timeline-main">
                <p className="timeline-company">{item.company}</p>
                <h3>{item.role}</h3>
                <p className="timeline-summary">{item.summary}</p>
                <ul className="tag-list timeline-tags">
                  {item.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
              </div>
              <div className="timeline-meta">
                <span>{item.period}</span>
                <span>{item.location}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section about-section" id="about">
        <SectionHeading
          eyebrow="Beyond the code"
          title="Strong fundamentals, practical leadership."
        />
        <div className="about-grid">
          <article className="education-card">
            <div className="card-icon">
              <GraduationCap size={24} />
            </div>
            <p className="eyebrow">Education</p>
            <h3>{portfolio.education.degree}</h3>
            <p className="institution">{portfolio.education.institution}</p>
            <div className="education-meta">
              <strong>{portfolio.education.score}</strong>
              <span>{portfolio.education.period}</span>
            </div>
            <p>{portfolio.education.detail}</p>
          </article>

          <article className="leadership-card">
            <div className="card-icon">
              <Award size={24} />
            </div>
            <p className="eyebrow">Leadership</p>
            {portfolio.leadership.map((item) => (
              <div className="leadership-item" key={item.role}>
                <div>
                  <h3>{item.role}</h3>
                  <p>{item.organization}</p>
                </div>
                <span>{item.period}</span>
                <p>{item.detail}</p>
              </div>
            ))}
          </article>
        </div>

        <div className="skills-wrap">
          <div className="skills-intro">
            <p className="eyebrow">Technical toolkit</p>
            <h3>A versatile stack, grounded in fundamentals.</h3>
          </div>
          <div className="skill-groups">
            {portfolio.skills.map((group) => (
              <div className="skill-group" key={group.title}>
                <h4>{group.title}</h4>
                <p>{group.items.join(" · ")}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="highlights">
          <div className="highlights-heading">
            <p className="eyebrow">Recognition</p>
            <h3>Proof of consistency.</h3>
            <a href={profile.leetcode} target="_blank" rel="noreferrer">
              View LeetCode profile <ArrowUpRight size={16} />
            </a>
          </div>
          <ol>
            {portfolio.highlights.map((highlight, index) => (
              <li key={highlight}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {highlight}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="contact-section" id="contact">
        <div className="contact-copy">
          <p className="eyebrow">Start a conversation</p>
          <h2>Have a role, project or hard problem in mind?</h2>
          <p>
            I&apos;m open to software engineering opportunities where I can build useful products,
            learn from strong teams and take real ownership.
          </p>
        </div>
        <div className="contact-links">
          <a href={`mailto:${profile.email}`}>
            <span>
              <Mail size={20} /> Email
            </span>
            {profile.email}
            <ArrowUpRight size={20} />
          </a>
          <a href={`tel:${profile.phone.replace(/\s/g, "")}`}>
            <span>
              <Phone size={20} /> Phone
            </span>
            {profile.phone}
            <ArrowUpRight size={20} />
          </a>
          <a href={profile.linkedin} target="_blank" rel="noreferrer">
            <span>
              <BriefcaseBusiness size={20} /> LinkedIn
            </span>
            /in/ojasvagrawal
            <ArrowUpRight size={20} />
          </a>
        </div>
      </section>

      <footer>
        <a className="brand footer-brand" href="#top">
          <span>{profile.shortName}</span>
          <strong>{profile.name}</strong>
        </a>
        <p>Designed and built with care in Indore.</p>
        <div>
          <a href={profile.github} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href={profile.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
          <a href="#top">Back to top</a>
        </div>
      </footer>
    </main>
  );
}
