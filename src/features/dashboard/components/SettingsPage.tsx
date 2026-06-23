import { useState, useRef } from 'react';
import {
  Download,
  Upload,
  Trash2,
  Info,
} from 'lucide-react';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';
import { downloadJson, readJsonFile } from '../../../lib/utils';
import { db } from '../../../db/database';
import { useToast } from '../../../components/ui/toast';

export default function SettingsPage() {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const handleExportAll = async () => {
    const projects = await db.projects.toArray();
    const themes = await db.themes.filter(t => !t.isBuiltIn).toArray();
    const ideas = await db.ideas.toArray();
    const refItems = await db.referenceItems.toArray();
    const refBoards = await db.referenceBoards.toArray();
    const scripts = await db.scripts.toArray();
    const scenes = await db.scenes.toArray();
    const shots = await db.shots.toArray();
    const shotList = await db.shotListItems.toArray();

    downloadJson({
      exportDate: new Date().toISOString(),
      data: { projects, themes, ideas, referenceItems: refItems, referenceBoards: refBoards, scripts, scenes, shots, shotListItems: shotList },
    }, `docprepro-backup-${new Date().toISOString().slice(0, 10)}.json`);

    toast.success('数据导出成功');
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const json = await readJsonFile<{ data: Record<string, any[]> }>(file);
      const { data } = json;
      if (data.projects) await db.projects.bulkPut(data.projects);
      if (data.themes) await db.themes.bulkPut(data.themes);
      if (data.ideas) await db.ideas.bulkPut(data.ideas);
      if (data.referenceItems) await db.referenceItems.bulkPut(data.referenceItems);
      if (data.referenceBoards) await db.referenceBoards.bulkPut(data.referenceBoards);
      if (data.scripts) await db.scripts.bulkPut(data.scripts);
      if (data.scenes) await db.scenes.bulkPut(data.scenes);
      if (data.shots) await db.shots.bulkPut(data.shots);
      if (data.shotListItems) await db.shotListItems.bulkPut(data.shotListItems);
      toast.success('数据导入成功，请刷新页面');
    } catch (err) {
      toast.error('导入失败：文件格式不正确');
    }
  };

  const handleClearAll = async () => {
    await db.projects.clear();
    await db.ideas.clear();
    await db.referenceItems.clear();
    await db.referenceBoards.clear();
    await db.scripts.clear();
    await db.scenes.clear();
    await db.shots.clear();
    await db.shotListItems.clear();
    setShowClearConfirm(false);
    toast.success('所有数据已清除');
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">设置</h1>
        <p className="text-sm text-text-tertiary mt-1">应用设置和数据管理</p>
      </div>

      {/* Data Management */}
      <Card>
        <Card.Header>
          <Card.Title>数据管理</Card.Title>
          <Card.Description>导出、导入或清除应用数据</Card.Description>
        </Card.Header>
        <Card.Content className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-bg-tertiary">
            <div className="flex items-center gap-3">
              <Download size={18} className="text-text-tertiary" />
              <div>
                <p className="text-sm text-text-primary">导出所有数据</p>
                <p className="text-xs text-text-tertiary">备份到 JSON 文件</p>
              </div>
            </div>
            <Button size="sm" variant="secondary" onClick={handleExportAll}>导出</Button>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-bg-tertiary">
            <div className="flex items-center gap-3">
              <Upload size={18} className="text-text-tertiary" />
              <div>
                <p className="text-sm text-text-primary">导入数据</p>
                <p className="text-xs text-text-tertiary">从 JSON 备份恢复</p>
              </div>
            </div>
            <label>
              <Button size="sm" variant="secondary" onClick={() => fileInputRef.current?.click()}>
                导入
              </Button>
              <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
            </label>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-error/5 border border-error/20">
            <div className="flex items-center gap-3">
              <Trash2 size={18} className="text-error" />
              <div>
                <p className="text-sm text-error">清除所有数据</p>
                <p className="text-xs text-text-tertiary">不可恢复</p>
              </div>
            </div>
            <Button size="sm" variant="danger" onClick={() => setShowClearConfirm(true)}>清除</Button>
          </div>
        </Card.Content>
      </Card>

      {/* About */}
      <Card>
        <Card.Header>
          <Card.Title>关于</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Info size={18} className="text-text-tertiary" />
                <div>
                  <p className="text-sm text-text-primary">闪电分镜</p>
                  <p className="text-xs text-text-tertiary">短视频纪录片前期制作工具</p>
                </div>
              </div>
              <span className="text-xs text-text-disabled">v1.0.0</span>
            </div>
            <div className="p-3 rounded-lg bg-bg-tertiary">
              <p className="text-xs text-text-secondary leading-relaxed">
                本应用是一款面向短视频纪录片创作者的前期制作工具，涵盖主题库搭建、脑暴构思、参考搜集、脚本撰写和分镜设计等环节。所有数据存储在浏览器本地，无需网络连接。
              </p>
            </div>
          </div>
        </Card.Content>
      </Card>

      {/* Clear confirm */}
      <ConfirmDialog
        open={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={handleClearAll}
        title="清除所有数据"
        message="此操作将删除所有项目、主题、脑暴、参考、脚本和分镜数据。此操作不可恢复！"
        confirmLabel="确认清除"
        variant="danger"
      />
    </div>
  );
}
