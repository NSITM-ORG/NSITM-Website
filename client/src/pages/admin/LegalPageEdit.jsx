import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useManageState } from '../../hooks/useManageState';
import { useSEO } from '../../hooks/useSEO';
import { Save, Globe, ArrowLeft, Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { FormField } from '../../components/ui/FormField';

const LINK_OPTIONS = [
  { label: 'Custom / External', value: 'custom' },
  { label: 'Home', value: '/' },
  { label: 'FAQ', value: '/faq' },
  { label: 'About Us', value: '/about' },
  { label: 'Contact', value: '/contact' },
  { label: 'Enroll', value: '/enroll' },
];

const getLinkOptions = (legalPages) => {
  const dynamicOptions = legalPages.list?.map(p => ({
    label: p.hero?.title || p.slug,
    value: `/${p.slug}`
  })) || [];
  return [...LINK_OPTIONS, ...dynamicOptions];
};

function LinkPresetDropdown({ value, onSelect, options }) {
  // If value matches an option's value (other than custom), select it. Else 'custom'
  const isMatch = options.find(o => o.value === value && o.value !== 'custom');
  const displayValue = isMatch ? value : 'custom';

  return (
    <FormField
      type="select"
      label={false}
      options={options}
      value={displayValue}
      onChange={(val) => {
        if (val !== 'custom') {
          const opt = options.find(o => o.value === val);
          onSelect(opt.label, val);
        } else {
          onSelect('', ''); // clear for custom entry
        }
      }}
      className="mb-2"
    />
  );
}

const STANDARD_ICONS = [
  'FileText', 'CheckCircle2', 'UserCheck', 'DollarSign', 'Award', 'ShieldAlert',
  'HelpCircle', 'Mail', 'Database', 'Eye', 'Lock', 'Bell', 'AlertTriangle',
  'BookOpen', 'Briefcase', 'Calendar', 'Camera', 'CreditCard', 'Globe',
  'Heart', 'Info', 'MessageSquare', 'Phone', 'Settings', 'Users', 'ArrowRight'
];

function IconPicker({ value, onChange, label = "Icon", size = "md", variant = "default", className = "" }) {
  const isStandard = STANDARD_ICONS.includes(value) || !value;
  const [isCustomMode, setIsCustomMode] = useState(!isStandard && value);

  useEffect(() => {
    if (STANDARD_ICONS.includes(value)) {
      setIsCustomMode(false);
    } else if (value && !STANDARD_ICONS.includes(value)) {
      setIsCustomMode(true);
    }
  }, [value]);

  const selectValue = isCustomMode ? 'custom_svg' : (value || '');

  const options = [
    { label: '-- Select an Icon --', value: '' },
    { label: '✨ Custom (Paste SVG Code)', value: 'custom_svg' },
    ...STANDARD_ICONS.map(i => ({ label: i, value: i }))
  ];

  const IconComponent = LucideIcons[value];
  const isRawSvg = value && (value.startsWith('<svg') || value.startsWith('<path'));

  const renderPreview = () => {
    if (isCustomMode && isRawSvg) {
      if (value.startsWith('<svg')) {
        return <div dangerouslySetInnerHTML={{ __html: value }} className="w-5 h-5 flex items-center justify-center *:w-full *:h-full text-text-secondary" />;
      }
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-text-secondary" dangerouslySetInnerHTML={{ __html: value }} />
      );
    }
    if (IconComponent) {
      return <IconComponent className="w-5 h-5 text-text-secondary" />;
    }
    return <LucideIcons.Image className="w-5 h-5 text-text-muted opacity-30" />;
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <FormField
            type="select"
            label={label !== false ? label : undefined}
            options={options}
            value={selectValue}
            onChange={(val) => {
              if (val === 'custom_svg') {
                setIsCustomMode(true);
                onChange('');
              } else {
                setIsCustomMode(false);
                onChange(val);
              }
            }}
            size={size}
            variant={variant}
          />
        </div>
        <div
          className="flex-shrink-0 h-10 w-10 border border-border rounded-lg bg-surface-elevated flex items-center justify-center mb-[1px]"
          title="Icon Preview"
        >
          {renderPreview()}
        </div>
      </div>
      {isCustomMode && (
        <FormField
          type="textarea"
          label={label !== false ? "Paste SVG Code" : undefined}
          placeholder={label === false ? "Paste SVG Code here..." : undefined}
          hint={label !== false ? "Copy SVG code from lucide.dev or another site and paste it here." : undefined}
          value={value}
          onChange={onChange}
          rows={4}
          size={size}
        />
      )}
    </div>
  );
}

export default function LegalPageEdit() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { legalPages, actions } = useManageState();
  const [formData, setFormData] = useState(null);
  const [draggedSectionIndex, setDraggedSectionIndex] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});

  useSEO({ title: `Edit Legal Page - ${slug}` });

  useEffect(() => {
    let cancelled = false;
    actions.fetchLegalPageAdmin(slug).then((res) => {
      if (!cancelled && res) setFormData(res);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (legalPages.loading || !formData) {
    return <div className="p-8 text-center text-text-secondary">Loading page editor...</div>;
  }

  const linkOptions = getLinkOptions(legalPages);

  const isLinkLocked = (val) => {
    if (!val) return false;
    return linkOptions.some(o => o.value === val && o.value !== 'custom');
  };

  const handleHeroChange = (field, value) => {
    setFormData((prev) => ({ ...prev, hero: { ...prev.hero, [field]: value } }));
  };

  const handleSupportChange = (field, value) => {
    setFormData((prev) => ({ ...prev, supportCallout: { ...prev.supportCallout, [field]: value } }));
  };

  const handleLinkChange = (side, field, value) => {
    setFormData((prev) => ({
      ...prev,
      bottomLinks: {
        ...prev.bottomLinks,
        [side]: { ...prev.bottomLinks[side], [field]: value },
      },
    }));
  };

  const addSection = () => {
    setFormData((prev) => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          id: `section-${Date.now()}`,
          icon: 'FileText',
          title: 'New Section',
          content: [],
        },
      ],
    }));
  };

  const updateSection = (idx, field, value) => {
    setFormData((prev) => {
      const newSections = [...prev.sections];
      newSections[idx] = { ...newSections[idx], [field]: value };
      return { ...prev, sections: newSections };
    });
  };

  const removeSection = (idx) => {
    setFormData((prev) => {
      const newSections = [...prev.sections];
      newSections.splice(idx, 1);
      return { ...prev, sections: newSections };
    });
  };

  const toggleSection = (idx) => {
    setExpandedSections((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  // HTML5 Drag and Drop for sections
  const handleDragStart = (e, idx) => {
    setDraggedSectionIndex(idx);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetIdx) => {
    e.preventDefault();
    if (draggedSectionIndex === null || draggedSectionIndex === targetIdx) return;

    setFormData((prev) => {
      const newSections = [...prev.sections];
      const draggedSection = newSections[draggedSectionIndex];
      newSections.splice(draggedSectionIndex, 1);
      newSections.splice(targetIdx, 0, draggedSection);
      return { ...prev, sections: newSections };
    });
    setDraggedSectionIndex(null);
  };

  // Blocks
  const addBlock = (sectionIdx, type) => {
    setFormData((prev) => {
      const newSections = [...prev.sections];
      const section = { ...newSections[sectionIdx] };
      const newBlock = { type };
      if (type === 'paragraph') newBlock.text = '';
      if (type === 'list' || type === 'grid') newBlock.items = [{ text: '', label: '', title: '', description: '' }];
      section.content = [...section.content, newBlock];
      newSections[sectionIdx] = section;
      return { ...prev, sections: newSections };
    });
    // Ensure section is expanded
    setExpandedSections((prev) => ({ ...prev, [sectionIdx]: true }));
  };

  const updateBlock = (sIdx, bIdx, field, value) => {
    setFormData((prev) => {
      const newSections = [...prev.sections];
      newSections[sIdx].content[bIdx] = { ...newSections[sIdx].content[bIdx], [field]: value };
      return { ...prev, sections: newSections };
    });
  };

  const updateListItem = (sIdx, bIdx, iIdx, field, value) => {
    setFormData((prev) => {
      const newSections = [...prev.sections];
      const block = { ...newSections[sIdx].content[bIdx] };
      block.items[iIdx] = { ...block.items[iIdx], [field]: value };
      newSections[sIdx].content[bIdx] = block;
      return { ...prev, sections: newSections };
    });
  };

  const addListItem = (sIdx, bIdx) => {
    setFormData((prev) => {
      const newSections = [...prev.sections];
      newSections[sIdx].content[bIdx].items.push({ text: '', label: '', title: '', description: '' });
      return { ...prev, sections: newSections };
    });
  };

  const removeListItem = (sIdx, bIdx, iIdx) => {
    setFormData((prev) => {
      const newSections = [...prev.sections];
      newSections[sIdx].content[bIdx].items.splice(iIdx, 1);
      return { ...prev, sections: newSections };
    });
  };

  const removeBlock = (sIdx, bIdx) => {
    setFormData((prev) => {
      const newSections = [...prev.sections];
      newSections[sIdx].content.splice(bIdx, 1);
      return { ...prev, sections: newSections };
    });
  };

  const handleSave = async () => {
    try {
      await actions.updateLegalPage({ slug, payload: formData });
      actions.addToast({ type: 'success', message: 'Page saved successfully.' });
    } catch (err) {
      // toast middleware handles error
    }
  };

  const handlePublish = async () => {
    try {
      await actions.publishLegalPage(slug);
      actions.addToast({ type: 'success', message: 'Page published successfully.' });
      navigate('/admin/legal-pages');
    } catch (err) {
      // toast middleware handles error
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/legal-pages')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="font-heading text-2xl font-bold text-text-primary">Edit Legal Page</h1>
            <p className="mt-1 font-mono text-sm text-text-secondary">{slug}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleSave} disabled={legalPages.saving} variant="outline" className="gap-2">
            <Save className="h-4 w-4" /> Save Draft
          </Button>
          <Button onClick={handlePublish} disabled={legalPages.saving} className="gap-2">
            <Globe className="h-4 w-4" /> Publish
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Hero Section */}
          <Card className="p-6">
            <h2 className="mb-4 font-heading text-lg font-semibold text-text-primary">Hero Configuration</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                label="Badge Text"
                value={formData.hero?.badgeText || ''}
                onChange={(v) => handleHeroChange('badgeText', v)}
              />
              <IconPicker
                label="Badge Icon"
                value={formData.hero?.badgeIcon || ''}
                onChange={(v) => handleHeroChange('badgeIcon', v)}
              />
              <div className="sm:col-span-2">
                <FormField
                  label="Title"
                  value={formData.hero?.title || ''}
                  onChange={(v) => handleHeroChange('title', v)}
                />
              </div>
              <div className="sm:col-span-2">
                <FormField
                  type="textarea"
                  label="Description"
                  rows={3}
                  value={formData.hero?.description || ''}
                  onChange={(v) => handleHeroChange('description', v)}
                />
              </div>
            </div>
          </Card>

          {/* Sections Builder */}
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-heading text-lg font-semibold text-text-primary">Content Sections</h2>
              <Button size="sm" onClick={addSection} className="gap-1">
                <Plus className="h-4 w-4" /> Add Section
              </Button>
            </div>

            <div className="space-y-4">
              {formData.sections?.map((section, sIdx) => (
                <div
                  key={section.id || sIdx}
                  draggable
                  onDragStart={(e) => handleDragStart(e, sIdx)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, sIdx)}
                  className="rounded-lg border border-primary/20 bg-surface p-4 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="cursor-grab text-text-muted hover:text-text-primary">
                      <GripVertical className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex w-full items-center gap-3 pr-4">
                          <FormField
                            value={section.title || ''}
                            onChange={(v) => updateSection(sIdx, 'title', v)}
                            placeholder="Section Title"
                            variant="ghost"
                            size="sm"
                            inputClassName="font-semibold"
                            className="flex-1"
                          />
                          <IconPicker
                            value={section.icon || ''}
                            onChange={(v) => updateSection(sIdx, 'icon', v)}
                            label={false}
                            variant="ghost"
                            size="sm"
                            className="w-48"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => toggleSection(sIdx)}>
                            {expandedSections[sIdx] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => removeSection(sIdx)} className="text-red-500 hover:bg-red-500/10">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {expandedSections[sIdx] && (
                    <div className="mt-4 space-y-4 pl-8">
                      {section.content?.map((block, bIdx) => (
                        <div key={bIdx} className="relative rounded bg-surface-elevated p-3">
                          <button
                            onClick={() => removeBlock(sIdx, bIdx)}
                            className="absolute right-2 top-2 text-text-muted hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>

                          {block.type === 'paragraph' && (
                            <div className="pr-6">
                              <FormField
                                type="textarea"
                                label="Paragraph (Punctuation auto-applied)"
                                value={block.text || ''}
                                onChange={(v) => updateBlock(sIdx, bIdx, 'text', v)}
                                rows={3}
                                size="sm"
                              />
                            </div>
                          )}

                          {block.type === 'list' && (
                            <div className="pr-6">
                              <label className="mb-2 block text-xs font-medium text-text-secondary">Bulleted List</label>
                              <div className="space-y-2">
                                {block.items?.map((item, iIdx) => (
                                  <div key={iIdx} className="flex gap-2">
                                    <FormField
                                      value={item.label || ''}
                                      onChange={(v) => updateListItem(sIdx, bIdx, iIdx, 'label', v)}
                                      placeholder="Bold Label (Optional)"
                                      size="sm"
                                      className="w-1/3"
                                    />
                                    <FormField
                                      value={item.text || ''}
                                      onChange={(v) => updateListItem(sIdx, bIdx, iIdx, 'text', v)}
                                      placeholder="List text..."
                                      size="sm"
                                      className="flex-1"
                                    />
                                    <button onClick={() => removeListItem(sIdx, bIdx, iIdx)} className="text-text-muted hover:text-red-500">
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                ))}
                                <Button variant="ghost" size="sm" onClick={() => addListItem(sIdx, bIdx)} className="mt-1 text-xs">
                                  + Add List Item
                                </Button>
                              </div>
                            </div>
                          )}

                          {block.type === 'grid' && (
                            <div className="pr-6">
                              <label className="mb-2 block text-xs font-medium text-text-secondary">Grid List</label>
                              <div className="space-y-2">
                                {block.items?.map((item, iIdx) => (
                                  <div key={iIdx} className="flex gap-2">
                                    <FormField
                                      value={item.title || ''}
                                      onChange={(v) => updateListItem(sIdx, bIdx, iIdx, 'title', v)}
                                      placeholder="Grid Title"
                                      size="sm"
                                      inputClassName="font-semibold"
                                      className="w-1/3"
                                    />
                                    <FormField
                                      value={item.description || ''}
                                      onChange={(v) => updateListItem(sIdx, bIdx, iIdx, 'description', v)}
                                      placeholder="Grid description..."
                                      size="sm"
                                      className="flex-1"
                                    />
                                    <button onClick={() => removeListItem(sIdx, bIdx, iIdx)} className="text-text-muted hover:text-red-500">
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                ))}
                                <Button variant="ghost" size="sm" onClick={() => addListItem(sIdx, bIdx)} className="mt-1 text-xs">
                                  + Add Grid Item
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}

                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" onClick={() => addBlock(sIdx, 'paragraph')} className="text-xs">
                          + Paragraph
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => addBlock(sIdx, 'list')} className="text-xs">
                          + List
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => addBlock(sIdx, 'grid')} className="text-xs">
                          + Grid
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Support Callout */}
          <Card className="p-6">
            <h2 className="mb-4 font-heading text-lg font-semibold text-text-primary">Support Callout</h2>
            <div className="space-y-4">
              <IconPicker
                label="Callout Icon"
                value={formData.supportCallout?.icon || ''}
                onChange={(v) => handleSupportChange('icon', v)}
              />
              <FormField
                label="Title"
                value={formData.supportCallout?.title || ''}
                onChange={(v) => handleSupportChange('title', v)}
              />
              <FormField
                type="textarea"
                label="Description"
                rows={2}
                value={formData.supportCallout?.description || ''}
                onChange={(v) => handleSupportChange('description', v)}
              />

              <div className="border-t border-primary/10 pt-4">
                <LinkPresetDropdown
                  value={formData.supportCallout?.ctaTo || formData.supportCallout?.ctaHref || ''}
                  options={linkOptions}
                  onSelect={(label, url) => {
                    handleSupportChange('ctaLabel', label);
                    handleSupportChange('ctaTo', url);
                  }}
                />
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <FormField
                    label="CTA Label"
                    value={formData.supportCallout?.ctaLabel || ''}
                    onChange={(e) => handleSupportChange('ctaLabel', e.target.value)}
                  />
                  <IconPicker
                    label="CTA Icon"
                    value={formData.supportCallout?.ctaIcon || ''}
                    onChange={(v) => handleSupportChange('ctaIcon', v)}
                  />
                  <FormField
                    label="CTA Link (To/Href)"
                    value={formData.supportCallout?.ctaTo || formData.supportCallout?.ctaHref || ''}
                    onChange={(e) => handleSupportChange('ctaTo', e.target.value)}
                    className="col-span-2"
                    disabled={isLinkLocked(formData.supportCallout?.ctaTo || formData.supportCallout?.ctaHref)}
                    hint={isLinkLocked(formData.supportCallout?.ctaTo || formData.supportCallout?.ctaHref) ? "Preset links cannot be manually edited. Change dropdown to 'Custom' to edit." : undefined}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Bottom Links */}
          <Card className="p-6">
            <h2 className="mb-4 font-heading text-lg font-semibold text-text-primary">Bottom Links</h2>
            <div className="space-y-4">
              <div>
                <h3 className="mb-2 text-sm font-medium text-text-secondary">Left Link</h3>
                <LinkPresetDropdown
                  value={formData.bottomLinks?.left?.to || ''}
                  options={linkOptions}
                  onSelect={(label, url) => {
                    handleLinkChange('left', 'label', label);
                    handleLinkChange('left', 'to', url);
                  }}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    placeholder="Label"
                    value={formData.bottomLinks?.left?.label || ''}
                    onChange={(e) => handleLinkChange('left', 'label', e.target.value)}
                  />
                  <FormField
                    placeholder="URL (/path)"
                    value={formData.bottomLinks?.left?.to || ''}
                    onChange={(e) => handleLinkChange('left', 'to', e.target.value)}
                    disabled={isLinkLocked(formData.bottomLinks?.left?.to)}
                    hint={isLinkLocked(formData.bottomLinks?.left?.to) ? "Preset link locked." : undefined}
                  />
                </div>
              </div>
              <div className="border-t border-primary/10 pt-4">
                <h3 className="mb-2 text-sm font-medium text-text-secondary">Right Link</h3>
                <LinkPresetDropdown
                  value={formData.bottomLinks?.right?.to || ''}
                  options={linkOptions}
                  onSelect={(label, url) => {
                    handleLinkChange('right', 'label', label);
                    handleLinkChange('right', 'to', url);
                  }}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    placeholder="Label"
                    value={formData.bottomLinks?.right?.label || ''}
                    onChange={(e) => handleLinkChange('right', 'label', e.target.value)}
                  />
                  <FormField
                    placeholder="URL (/path)"
                    value={formData.bottomLinks?.right?.to || ''}
                    onChange={(e) => handleLinkChange('right', 'to', e.target.value)}
                    disabled={isLinkLocked(formData.bottomLinks?.right?.to)}
                    hint={isLinkLocked(formData.bottomLinks?.right?.to) ? "Preset link locked." : undefined}
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
