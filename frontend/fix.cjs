const fs = require('fs');
const path = require('path');
const dir = 'c:\\Users\\graci\\Desktop\\Projects\\db_nexus\\ITEA\\iTea_Soft\\frontend\\src\\components\\sales\\forms';

const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  const initialContent = content;

  content = content.replace(/className="bg-gray-50 p-4 rounded-xl border border-gray-100"/g, 'className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-xl border border-gray-100 dark:border-slate-700"');
  content = content.replace(/className="text-xs font-bold text-gray-700 uppercase/g, 'className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase');
  content = content.replace(/className="bg-emerald-50\/20 p-4 rounded-xl border border-emerald-100"/g, 'className="bg-emerald-50/20 dark:bg-emerald-500/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-500/20"');
  content = content.replace(/className="text-xs font-bold text-emerald-700 uppercase/g, 'className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase');

  if (content !== initialContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated ' + file);
  }
}
