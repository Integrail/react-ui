/**
 * PermissionRulesList — Displays and manages saved permission rules.
 *
 * Shows persistent user permission rules with toggle, delete, and
 * session cache clear functionality. Intended for agent settings or sidebar.
 */

import React, { memo, useCallback } from 'react';
import { Trash2, Shield, ShieldCheck, ShieldX, ShieldQuestion } from 'lucide-react';
import type { IPermissionRulesListProps, IPermissionRuleInfo } from './types';

const ACTION_CONFIG: Record<string, { icon: typeof ShieldCheck; color: string; label: string }> = {
  allow: { icon: ShieldCheck, color: '#10b981', label: 'Allow' },
  deny: { icon: ShieldX, color: '#ef4444', label: 'Deny' },
  ask: { icon: ShieldQuestion, color: '#f59e0b', label: 'Ask' },
};

function formatCondition(c: { argName: string; operator: string; value: string }): string {
  const op = c.operator.replace(/_/g, ' ');
  return `${c.argName} ${op} "${c.value}"`;
}

function formatTimeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const RuleItem: React.FC<{
  rule: IPermissionRuleInfo;
  onToggle?: (ruleId: string, enabled: boolean) => void;
  onDelete?: (ruleId: string) => void;
}> = memo(({ rule, onToggle, onDelete }) => {
  const config = ACTION_CONFIG[rule.action] || ACTION_CONFIG.ask;
  const ActionIcon = config.icon;

  const handleToggle = useCallback(() => {
    onToggle?.(rule.id, !rule.enabled);
  }, [onToggle, rule.id, rule.enabled]);

  const handleDelete = useCallback(() => {
    onDelete?.(rule.id);
  }, [onDelete, rule.id]);

  return (
    <div className={`permission-rule ${rule.enabled ? '' : 'permission-rule--disabled'}`}>
      <div className="permission-rule__header">
        <label className="permission-rule__toggle">
          <input
            type="checkbox"
            checked={rule.enabled}
            onChange={handleToggle}
            disabled={!onToggle}
          />
        </label>

        <ActionIcon size={14} className="permission-rule__action-icon" color={config.color} />

        <span className="permission-rule__tool-name">{rule.toolName === '*' ? 'All tools' : rule.toolName}</span>
        <span className="permission-rule__arrow">&rarr;</span>
        <span className="permission-rule__action" style={{ color: config.color }}>
          {config.label}
        </span>
        {rule.unconditional && (
          <span className="permission-rule__badge">unconditional</span>
        )}

        {onDelete && (
          <button
            className="permission-rule__delete"
            onClick={handleDelete}
            title="Delete rule"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>

      {rule.conditions && rule.conditions.length > 0 && (
        <div className="permission-rule__conditions">
          {rule.conditions.map((c, i) => (
            <span key={i} className="permission-rule__condition">
              {formatCondition(c)}
            </span>
          ))}
        </div>
      )}

      <div className="permission-rule__meta">
        {rule.description && (
          <span className="permission-rule__description">{rule.description}</span>
        )}
        <span className="permission-rule__created">
          {rule.createdBy === 'approval_dialog' ? 'via approval' : rule.createdBy}
          {' \u00B7 '}
          {formatTimeAgo(rule.updatedAt)}
        </span>
      </div>
    </div>
  );
});

RuleItem.displayName = 'RuleItem';

export const PermissionRulesList: React.FC<IPermissionRulesListProps> = memo(
  ({ rules, onToggleRule, onDeleteRule, onClearSession, className = '' }) => {
    return (
      <div className={`permission-rules ${className}`}>
        <div className="permission-rules__header">
          <Shield size={14} />
          <span className="permission-rules__title">Permission Rules</span>
          <span className="permission-rules__count">{rules.length}</span>
          {onClearSession && (
            <button
              className="permission-rules__clear-btn"
              onClick={onClearSession}
              title="Clear session approval cache (does not delete persistent rules)"
            >
              Clear session cache
            </button>
          )}
        </div>

        {rules.length === 0 ? (
          <div className="permission-rules__empty">
            No permission rules configured. Rules are created when you approve or deny tool execution with "Always" scope.
          </div>
        ) : (
          <div className="permission-rules__list">
            {rules.map((rule) => (
              <RuleItem
                key={rule.id}
                rule={rule}
                onToggle={onToggleRule}
                onDelete={onDeleteRule}
              />
            ))}
          </div>
        )}
      </div>
    );
  },
);

PermissionRulesList.displayName = 'PermissionRulesList';

export default PermissionRulesList;
