import React, { useState } from 'react';
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  ChevronRight,
  MessageSquare,
  Award,
  Zap
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Course } from '../types';

export const CoursesPage: React.FC = () => {
  const { courses, setActiveTab, setActiveChatId } = useApp();

  // AI Recommender Quiz States
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [domainInterest, setDomainInterest] = useState('Web Development');
  const [experienceLevel, setExperienceLevel] = useState('Beginner');
  const [weeklyHours, setWeeklyHours] = useState('5-10 Hours');
  const [recommendedCourse, setRecommendedCourse] = useState<Course | null>(null);

  const handleRunRecommender = () => {
    let match: Course | undefined;
    if (domainInterest === 'Web Development') {
      match = courses.find((c) => c.code === 'WEB-101');
    } else if (domainInterest === 'Artificial Intelligence') {
      match = courses.find((c) => c.code === 'AI-202');
    } else if (domainInterest === 'Python Programming') {
      match = courses.find((c) => c.code === 'PY-100');
    } else if (domainInterest === 'UI/UX Design') {
      match = courses.find((c) => c.code === 'UIX-301');
    } else {
      match = courses.find((c) => c.code === 'AWS-401');
    }
    setRecommendedCourse(match || courses[0]);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider">
            <GraduationCap className="w-4 h-4" />
            Academic Catalog & AI Guidance
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            Course Management & AI Recommender
          </h1>
          <p className="text-xs text-slate-500 max-w-2xl">
            Explore active online course programs or run the interactive AI Recommendation Wizard to match 
            students with the ideal learning track.
          </p>
        </div>

        <button
          onClick={() => setIsQuizOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          Launch AI Recommendation Wizard
        </button>
      </div>

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold bg-slate-900 text-cyan-400 px-2 py-0.5 rounded">
                  {course.code}
                </span>
                <span
                  className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                    course.status === 'active'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {course.status}
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-sm leading-snug">{course.title}</h3>

              <div className="space-y-1.5 text-xs text-slate-600 border-y border-slate-100 py-3">
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Instructor: <strong>{course.instructor}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[11px]">{course.schedule}</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> {course.duration}
                  </span>
                  <span className="font-mono font-bold text-emerald-600 text-sm">
                    ${course.fee} USD
                  </span>
                </div>
              </div>

              {/* Syllabus Preview */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Key Curriculum Topics:
                </span>
                <ul className="space-y-1 text-[11px] text-slate-700">
                  {course.syllabus.slice(0, 3).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              onClick={() => {
                setActiveTab('simulator');
              }}
              className="w-full py-2 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-800 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              Inquire via WhatsApp Simulator
            </button>
          </div>
        ))}
      </div>

      {/* AI Recommendation Modal */}
      {isQuizOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                AI Course Recommendation Wizard
              </h3>
              <button onClick={() => setIsQuizOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            {!recommendedCourse ? (
              <div className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">1. What domain interest do you want to master?</label>
                  <select
                    value={domainInterest}
                    onChange={(e) => setDomainInterest(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  >
                    <option value="Web Development">Web Development (React, Node.js)</option>
                    <option value="Artificial Intelligence">Artificial Intelligence & Data Science</option>
                    <option value="Python Programming">Python Programming (Beginner)</option>
                    <option value="UI/UX Design">UI/UX Design Systems (Figma)</option>
                    <option value="Cloud Engineering">Cloud Engineering (AWS & DevOps)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">2. What is your prior background level?</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setExperienceLevel(lvl)}
                        className={`p-2 rounded-xl border text-center transition-all ${
                          experienceLevel === lvl
                            ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-500'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">3. How many hours per week can you dedicate?</label>
                  <select
                    value={weeklyHours}
                    onChange={(e) => setWeeklyHours(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  >
                    <option value="3-5 Hours">3-5 Hours / Week (Light)</option>
                    <option value="5-10 Hours">5-10 Hours / Week (Moderate)</option>
                    <option value="10+ Hours">10+ Hours / Week (Intensive Bootcamp)</option>
                  </select>
                </div>

                <button
                  onClick={handleRunRecommender}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4 text-slate-950" />
                  Evaluate & Match Best Course
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold uppercase tracking-wider text-[10px] text-emerald-800">
                      🎯 Recommended Match (98% Compatibility)
                    </span>
                    <span className="font-mono font-bold bg-emerald-800 text-white px-2 py-0.5 rounded text-[10px]">
                      {recommendedCourse.code}
                    </span>
                  </div>
                  <h4 className="font-bold text-base text-slate-900">{recommendedCourse.title}</h4>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    Based on your preference for <strong>{domainInterest}</strong> at a <strong>{experienceLevel}</strong> level, 
                    this course delivers live interactive lectures with hands-on capstone projects tailored to your schedule.
                  </p>
                </div>

                <div className="flex justify-between gap-2 pt-2">
                  <button
                    onClick={() => setRecommendedCourse(null)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl"
                  >
                    Back to Quiz
                  </button>
                  <button
                    onClick={() => {
                      setIsQuizOpen(false);
                      setRecommendedCourse(null);
                      setActiveTab('simulator');
                    }}
                    className="px-5 py-2 bg-emerald-500 text-slate-950 font-bold rounded-xl shadow-md flex items-center gap-1"
                  >
                    Open Simulator Inquiry →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
