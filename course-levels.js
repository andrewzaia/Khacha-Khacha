(function () {
  'use strict';
  // Course configuration. Additional level modules can append lessons, quizzes and
  // practice banks before app.js starts; populated levels become playable automatically.
  const D=window.Assyrian;
  if(!D||!Array.isArray(D.lessons))throw new Error('Load data.js before course-levels.js');
  D.lessons.forEach(lesson=>{if(!lesson.level)lesson.level='beginner';});
  D.levels=[
    {id:'beginner',title:'Beginner',number:1,description:'Letters, first words and simple conversations.'},
    {id:'intermediate',title:'Intermediate',number:2,description:'Longer sentences and everyday conversations.'},
    {id:'advanced',title:'Advanced',number:3,description:'More complex conversations, comprehension and fluency.'}
  ];
  D.getLessons=level=>D.lessons.filter(lesson=>lesson.level===level);
})();
