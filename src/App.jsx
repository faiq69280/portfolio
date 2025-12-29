import React, { useState } from 'react';
import { Github, Linkedin, Mail, ArrowLeft } from 'lucide-react';

const Portfolio = () => {
  const [currentView, setCurrentView] = useState('home');
  const [selectedProject, setSelectedProject] = useState(null);

  const projects = {
    ecommerce: {
      title: 'E-Commerce System',
      status: 'In Progress',
      tagline: 'A system built to study real failure scenarios',
      problem: 'Most e-commerce tutorials skip the hard parts: what happens when payment providers timeout, inventory gets oversold, or orders get stuck in limbo. I built this to understand how real systems handle these edge cases.',
      architecture: [
        'Order service manages state transitions through a finite state machine',
        'Inventory service handles reservations with TTL and deduction logic',
        'Payment service integrates with external providers, handling success/failure/timeout states',
        'Event-driven communication for async operations like notifications and auditing',
        'PostgreSQL for transactional consistency where it matters, Redis for reservation locks'
      ],
      decisions: [
        {
          choice: 'Inventory reservation before payment',
          reasoning: 'Reserve items with a 10-minute TTL. Release on timeout or payment failure. Prevents overselling without holding stock indefinitely.',
          tradeoff: 'Adds complexity. Alternative would be optimistic deduction with compensation, but that creates worse UX when stock runs out during checkout.'
        },
        {
          choice: 'Idempotency keys on order creation',
          reasoning: 'Network retries can cause duplicate orders. Idempotency keys ensure the same request produces the same result.',
          tradeoff: 'Requires key storage and expiration logic. Worth it to prevent double-charging customers.'
        },
        {
          choice: 'Async event processing for non-critical paths',
          reasoning: 'Confirmation emails and analytics don\'t need to block order completion. Queue them for async processing.',
          tradeoff: 'Eventual consistency. Users might complete checkout before receiving email. Acceptable for this use case.'
        }
      ],
      failures: [
        'Payment provider timeout: order stays in pending state. Built a background job to poll provider status and reconcile.',
        'Inventory reservation expires during slow checkout: user sees "item no longer available" after payment. Added pre-payment validation step.',
        'Concurrent requests to same inventory: race condition on stock count. Implemented pessimistic locking for inventory reads during reservation.',
        'Event processing failure: lost notification events. Added dead letter queue and monitoring.'
      ],
      next: [
        'Simulate partial outages: database connection pool exhaustion, service degradation',
        'Implement saga pattern for distributed transactions across order/payment/inventory',
        'Add OpenTelemetry tracing to visualize request flow through services',
        'Load test with k6 to identify bottlenecks'
      ]
    },
    blogging: {
      title: 'Microservices Blogging Platform',
      status: 'Completed',
      tagline: 'Built to understand microservices architecture beyond buzzwords',
      problem: 'Microservices are often presented as either a silver bullet or over-engineering. I built this to understand the actual complexity: service boundaries, data consistency, and when the cost is worth it.',
      architecture: [
        'API Gateway handles routing, rate limiting, and request validation',
        'Auth Service manages users, sessions, JWT tokens',
        'Content Service handles posts, comments, drafts',
        'Notification Service processes email/push notifications asynchronously',
        'Each service has its own PostgreSQL database (no shared schema)',
        'Redis for session storage and content caching',
        'RabbitMQ for async messaging between services',
        'S3 for media uploads with pre-signed URLs'
      ],
      decisions: [
        {
          choice: 'Database per service',
          reasoning: 'Each service owns its data. Changes to one schema don\'t cascade. Services can scale independently.',
          tradeoff: 'No foreign keys across services. Joins become API calls. Eventual consistency on reads. Had to implement distributed data patterns.'
        },
        {
          choice: 'Redis cache with TTL',
          reasoning: 'Popular posts get hammered. Cache responses for 60 seconds to reduce database load.',
          tradeoff: 'Stale reads. Cache invalidation on updates is hard. Implemented cache-aside pattern with write-through on critical paths.'
        },
        {
          choice: 'Async notifications via message queue',
          reasoning: 'Don\'t block content creation while sending emails. Notifications aren\'t critical path.',
          tradeoff: 'User publishes post, notification arrives seconds later. Acceptable delay. Notifications can fail silently—added retry logic and monitoring.'
        },
        {
          choice: 'API Gateway as single entry point',
          reasoning: 'Centralized auth, rate limiting, routing. Services don\'t need to implement these concerns.',
          tradeoff: 'Single point of failure. Adds latency. Worth it for simplified service logic and consistent security layer.'
        }
      ],
      failures: [
        'Cache stampede: popular post cache expires, 100 requests hit database simultaneously. Added probabilistic early expiration.',
        'Service-to-service coupling: content service called notification service directly. Changed to event-driven to decouple.',
        'Distributed transaction complexity: user publishes post, notification fails. Post is live but users aren\'t notified. Acceptable for this system, but learned about saga patterns.',
        'S3 upload timeout: large images failed silently. Implemented client-side compression and progress tracking.'
      ],
      next: [
        'Was this worth the complexity? For a blogging platform, probably not. Learned the cost of microservices firsthand.',
        'Would use this pattern again for: domains with truly independent lifecycles, teams that need autonomous deployment, services that scale differently.',
        'Would not use for: CRUD apps, small teams, startups finding product-market fit.'
      ]
    }
  };

  const ProjectCard = ({ projectKey, project }) => (
    <div 
      onClick={() => {
        setSelectedProject(projectKey);
        setCurrentView('project');
      }}
      className="border border-gray-800 p-8 hover:border-gray-600 transition-colors cursor-pointer group"
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-light tracking-wide group-hover:text-gray-300 transition-colors">
          {project.title}
        </h3>
        <span className="text-xs text-gray-500 uppercase tracking-wider">
          {project.status}
        </span>
      </div>
      <p className="text-gray-400 text-sm leading-relaxed">
        {project.tagline}
      </p>
    </div>
  );

  const ProjectDetail = ({ project }) => (
    <div className="max-w-3xl mx-auto">
      <button 
        onClick={() => setCurrentView('home')}
        className="flex items-center gap-2 text-gray-400 hover:text-gray-200 mb-12 transition-colors"
      >
        <ArrowLeft size={16} />
        <span className="text-sm">Back</span>
      </button>

      <div className="mb-12">
        <h1 className="text-3xl font-light tracking-wide mb-3">{project.title}</h1>
        <p className="text-gray-400 text-sm uppercase tracking-wider">{project.status}</p>
      </div>

      <section className="mb-16">
        <h2 className="text-xl font-light mb-4 text-gray-300">Problem</h2>
        <p className="text-gray-400 leading-relaxed">{project.problem}</p>
      </section>

      <section className="mb-16">
        <h2 className="text-xl font-light mb-4 text-gray-300">Architecture</h2>
        <div className="space-y-3">
          {project.architecture.map((item, i) => (
            <p key={i} className="text-gray-400 leading-relaxed pl-4 border-l border-gray-800">
              {item}
            </p>
          ))}
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-xl font-light mb-6 text-gray-300">Key Decisions</h2>
        <div className="space-y-8">
          {project.decisions.map((decision, i) => (
            <div key={i} className="border-l border-gray-800 pl-6">
              <h3 className="text-gray-300 mb-2 font-light">{decision.choice}</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-3">{decision.reasoning}</p>
              <p className="text-gray-500 text-sm leading-relaxed italic">
                Trade-off: {decision.tradeoff}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-xl font-light mb-4 text-gray-300">Failure Modes</h2>
        <div className="space-y-3">
          {project.failures.map((failure, i) => (
            <p key={i} className="text-gray-400 leading-relaxed pl-4 border-l border-gray-800">
              {failure}
            </p>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-light mb-4 text-gray-300">
          {selectedProject === 'ecommerce' ? 'What\'s Next' : 'Lessons Learned'}
        </h2>
        <div className="space-y-3">
          {project.next.map((item, i) => (
            <p key={i} className="text-gray-400 leading-relaxed pl-4 border-l border-gray-800">
              {item}
            </p>
          ))}
        </div>
      </section>
    </div>
  );

  const HomePage = () => (
    <>
      <section className="min-h-[60vh] flex flex-col justify-center items-center text-center mb-32">
        <h1 className="text-4xl md:text-5xl font-light tracking-wide mb-6 leading-tight">
          Creativity doesn't ask for permission.
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl leading-relaxed">
          From every era, someone chooses to build differently. I'm choosing to be one of them.
        </p>
        <div className="mt-12 w-40 h-40 bg-gray-800 rounded-sm flex items-center justify-center text-gray-600 text-xs">
          Your headshot here
        </div>
      </section>

      <section className="mb-32">
        <h2 className="text-2xl font-light tracking-wide mb-8 text-gray-300">Featured Projects</h2>
        <div className="grid gap-6">
          <ProjectCard projectKey="ecommerce" project={projects.ecommerce} />
          <ProjectCard projectKey="blogging" project={projects.blogging} />
        </div>
      </section>

      <section className="mb-32">
        <h2 className="text-2xl font-light tracking-wide mb-6 text-gray-300">About</h2>
        <p className="text-gray-400 leading-relaxed max-w-2xl">
          I'm a backend engineer focused on understanding how real systems behave under pressure. 
          I build projects to explore architecture trade-offs, failure modes, and the decisions 
          tutorials don't teach. Each system is a study in what breaks first and why.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-light tracking-wide mb-6 text-gray-300">Contact</h2>
        <div className="flex gap-8">
          <a href="https://linkedin.com" className="flex items-center gap-2 text-gray-400 hover:text-gray-200 transition-colors">
            <Linkedin size={18} />
            <span className="text-sm">LinkedIn</span>
          </a>
          <a href="https://github.com" className="flex items-center gap-2 text-gray-400 hover:text-gray-200 transition-colors">
            <Github size={18} />
            <span className="text-sm">GitHub</span>
          </a>
          <a href="mailto:contact@example.com" className="flex items-center gap-2 text-gray-400 hover:text-gray-200 transition-colors">
            <Mail size={18} />
            <span className="text-sm">Email</span>
          </a>
        </div>
      </section>
    </>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">
        {currentView === 'home' && <HomePage />}
        {currentView === 'project' && selectedProject && (
          <ProjectDetail project={projects[selectedProject]} />
        )}
      </div>
    </div>
  );
};

export default Portfolio;