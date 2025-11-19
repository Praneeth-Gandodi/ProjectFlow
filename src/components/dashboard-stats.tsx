import { Card, CardContent } from '@/components/ui/card';
import { Lightbulb, CheckCircle, FolderKanban, BookOpen, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DashboardStatsProps {
  ideasCount: number;
  completedCount: number;
  coursesCount: number;
  completedCoursesCount: number;
}

export function DashboardStats({ ideasCount, completedCount, coursesCount, completedCoursesCount }: DashboardStatsProps) {
  const totalProjects = ideasCount + completedCount;

  const stats = [
    {
      title: "Total Projects",
      value: totalProjects,
      subtext: `${ideasCount} ideas, ${completedCount} done`,
      icon: FolderKanban,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "In Progress",
      value: ideasCount,
      subtext: "Currently active",
      icon: Lightbulb,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      title: "Completed",
      value: completedCount,
      subtext: "Successfully finished",
      icon: CheckCircle,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Learning",
      value: coursesCount,
      subtext: `${completedCoursesCount} courses finished`,
      icon: BookOpen,
      color: "text-violet-500",
      bg: "bg-violet-500/10",
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
    >
      {stats.map((stat, index) => (
        <motion.div key={index} variants={item}>
          <Card className="glass-card border-none shadow-sm hover:shadow-md transition-all duration-300">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <div className="text-2xl font-bold font-headline">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.subtext}</p>
              </div>
              <div className={cn("p-3 rounded-xl", stat.bg)}>
                <stat.icon className={cn("h-5 w-5", stat.color)} />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
