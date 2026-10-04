import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { readManagedEntities, writeManagedEntities, type ManagedEntity } from "@/lib/goetiaAdmin";
import { ArrowLeft, Edit2, Home, Lock, Plus, Trash2, Unlock, Upload, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";

const defaultCategory = "Entidade Maior";
const emptyEntity: ManagedEntity = {
  id: 0,
  slug: "",
  name: "",
  category: defaultCategory,
  title: "",
  area: "",
  enn: "",
  planeta: "",
  elemento: "",
  metal: "",
  incenso: "",
  melhoresDias: "",
  legioes: "",
  historia: "",
  poderes: [],
  image: "/images/symbol_flame.png",
  sigil: "/images/symbol_flame.png",
};

function EntityCard({ entity, isAdmin, onEdit, onDelete }: {
  entity: ManagedEntity;
  isAdmin: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="group relative h-full overflow-hidden rounded-2xl border border-primary/10 bg-zinc-950/90 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_0_35px_rgba(212,175,55,0.12)]">
      {isAdmin && (
        <div className="absolute right-2 top-2 z-20 flex gap-1 rounded bg-black/85 p-1">
          <Button size="icon" variant="ghost" onClick={(event) => { event.preventDefault(); event.stopPropagation(); onEdit(); }} className="h-8 w-8 text-zinc-300 hover:text-primary" aria-label={`Editar ${entity.name}`} title="Editar daemon">
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={(event) => { event.preventDefault(); event.stopPropagation(); onDelete(); }} className="h-8 w-8 text-zinc-300 hover:text-red-400" aria-label={`Excluir ${entity.name}`} title="Excluir daemon">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
      <Link href={`/goetia/${entity.slug}`} className="block h-full">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.12),transparent_55%)]" />
        <CardHeader className="relative pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="text-[10px] uppercase tracking-[0.35em] text-primary/50">#{entity.slug}</p>
              <CardTitle className="mt-2 font-cinzel text-3xl text-primary">{entity.name}</CardTitle>
              <p className="mt-2 text-sm text-zinc-400">{entity.title}</p>
            </div>
            <Badge className="whitespace-nowrap border-primary/20 bg-primary/10 text-[10px] uppercase tracking-[0.24em] text-primary">{entity.category}</Badge>
          </div>
        </CardHeader>
        <CardContent className="relative space-y-6 p-6 pt-0">
          <div className="flex justify-center">
            <div className="rounded-xl border border-white/5 bg-black/50 p-4">
              <img src={entity.sigil} alt={`Sigilo de ${entity.name}`} className="h-40 w-40 object-contain opacity-80 transition-all duration-300 group-hover:scale-105 group-hover:opacity-100 invert" onError={(event) => { event.currentTarget.src = "/images/symbol_flame.png"; }} />
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}

function slugify(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function Goetia() {
  const [, setLocation] = useLocation();
  const [entities, setEntities] = useState<ManagedEntity[]>(() => readManagedEntities());
  const [isAdmin, setIsAdmin] = useState(() => Boolean(sessionStorage.getItem("domus_admin_token")));
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [editingEntity, setEditingEntity] = useState<ManagedEntity | null>(null);
  const [formError, setFormError] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => writeManagedEntities(entities), [entities]);

  const categories = useMemo(() => {
    const values = entities.map((entity) => entity.category.trim()).filter(Boolean);
    return Array.from(new Set(values));
  }, [entities]);

  async function login() {
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: password.trim() }),
      });
      if (!response.ok) throw new Error();
      const data = await response.json();
      sessionStorage.setItem("domus_admin_token", data.token);
      setIsAdmin(true);
      setShowAuthModal(false);
      setPassword("");
      setAuthError("");
    } catch {
      setAuthError("Senha de administrador incorreta.");
    }
  }

  function updateForm(field: keyof ManagedEntity, value: string) {
    setEditingEntity((current) => current ? { ...current, [field]: value } : current);
  }

  function uploadMedia(event: React.ChangeEvent<HTMLInputElement>, field: "image" | "sigil") {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      updateForm(field, typeof reader.result === "string" ? reader.result : "");
      setIsUploading(false);
    };
    reader.onerror = () => {
      setFormError("Não foi possível carregar a imagem.");
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  }

  function saveEntity() {
    if (!editingEntity) return;
    const name = editingEntity.name.trim();
    const category = editingEntity.category.trim();
    if (!name || !category || !editingEntity.title.trim()) {
      setFormError("Preencha nome, título e categoria.");
      return;
    }
    const slug = editingEntity.slug || slugify(name);
    if (!slug) {
      setFormError("Informe um nome válido.");
      return;
    }
    const nextEntity = { ...editingEntity, name, category, title: editingEntity.title.trim(), slug, id: editingEntity.id || Date.now() };
    setEntities((current) => current.some((item) => item.slug === editingEntity.slug) ? current.map((item) => item.slug === editingEntity.slug ? nextEntity : item) : [nextEntity, ...current]);
    setEditingEntity(null);
    setFormError("");
  }

  function deleteEntity(entity: ManagedEntity) {
    if (!confirm(`Deseja excluir o daemon "${entity.name}"?`)) return;
    setEntities((current) => current.filter((item) => item.slug !== entity.slug));
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-3">
          <Button onClick={() => window.history.back()} variant="ghost" size="sm" className="border border-primary/20 text-primary hover:bg-primary/10"><ArrowLeft className="mr-2 h-4 w-4" />Voltar</Button>
          <Button onClick={() => setLocation("/")} variant="ghost" size="sm" className="border border-primary/20 text-primary hover:bg-primary/10"><Home className="mr-2 h-4 w-4" />Home</Button>
        </div>
        {isAdmin ? (
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => { setEditingEntity({ ...emptyEntity, id: Date.now() }); setFormError(""); }} size="sm" className="bg-primary text-black"><Plus className="mr-1.5 h-4 w-4" />Novo daemon</Button>
            <Button onClick={() => { setIsAdmin(false); sessionStorage.removeItem("domus_admin_token"); }} variant="outline" size="sm" className="border-red-500/30 text-red-400"><Unlock className="mr-1.5 h-4 w-4" />Sair</Button>
          </div>
        ) : (
          <Button onClick={() => { setAuthError(""); setPassword(""); setShowAuthModal(true); }} variant="outline" size="sm" className="border-primary/20 text-zinc-400 hover:text-primary"><Lock className="mr-1.5 h-4 w-4" />Acesso Admin</Button>
        )}
      </div>

      <header className="mb-12 text-center">
        <h1 className="mb-4 font-cinzel text-4xl uppercase tracking-widest text-primary">Hierarquia Infernal</h1>
        <p className="font-light italic text-muted-foreground">“Conhecimento, Tradição e Prática do Templo Domus Luciferis”</p>
      </header>
      <div className="mb-10 rounded-2xl border border-primary/10 bg-zinc-950/70 p-6">
        <p className="mb-2 text-[10px] uppercase tracking-[0.35em] text-primary/50">Catálogo</p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-cinzel text-2xl text-primary">Selecione uma categoria</h2>
          <p className="max-w-2xl text-sm leading-7 text-zinc-400">Conheça as entidades da Goetia, suas histórias, sigilos e correspondências.</p>
        </div>
      </div>

      <Tabs defaultValue={categories[0] || defaultCategory} className="w-full">
        <div className="mb-8 flex justify-center"><TabsList className="h-auto flex-wrap justify-center border border-primary/20 bg-zinc-900/60 p-2">
          {categories.map((category) => <TabsTrigger key={category} value={category} className="px-4 font-cinzel text-[10px] uppercase tracking-widest sm:text-xs">{category}</TabsTrigger>)}
        </TabsList></div>
        {categories.map((category) => (
          <TabsContent key={category} value={category} className="animate-in fade-in zoom-in duration-500">
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {entities.filter((entity) => entity.category === category).map((entity) => <EntityCard key={entity.slug} entity={entity} isAdmin={isAdmin} onEdit={() => setEditingEntity({ ...entity })} onDelete={() => deleteEntity(entity)} />)}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {showAuthModal && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"><Card className="w-full max-w-sm border-primary/40 bg-zinc-950 p-6 text-zinc-200"><div className="mb-4 flex justify-between border-b border-primary/20 pb-3"><h3 className="font-cinzel text-lg text-primary">Acesso Admin da Goetia</h3><Button size="icon" variant="ghost" onClick={() => setShowAuthModal(false)}><X className="h-4 w-4" /></Button></div><Input type="password" placeholder="Senha de administrador" value={password} onChange={(event) => setPassword(event.target.value)} onKeyDown={(event) => event.key === "Enter" && login()} />{authError && <p className="mt-2 text-sm text-red-400">{authError}</p>}<div className="mt-5 flex justify-end gap-2"><Button variant="ghost" onClick={() => setShowAuthModal(false)}>Cancelar</Button><Button onClick={login} className="bg-primary text-black">Entrar</Button></div></Card></div>}

      {editingEntity && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"><Card className="max-h-[90vh] w-full max-w-2xl overflow-y-auto border-primary/40 bg-zinc-950 p-6 text-zinc-200"><div className="mb-4 flex justify-between border-b border-primary/20 pb-3"><h3 className="font-cinzel text-lg text-primary">{editingEntity.slug ? "Editar daemon" : "Novo daemon"}</h3><Button size="icon" variant="ghost" onClick={() => setEditingEntity(null)}><X className="h-4 w-4" /></Button></div><div className="grid gap-3 md:grid-cols-2">
        {(["name", "title", "category", "area", "enn", "planeta", "elemento", "metal", "incenso", "melhoresDias", "legioes", "image", "sigil"] as const).map((field) => <Input key={field} placeholder={`${field} *`} value={editingEntity[field] as string} onChange={(event) => updateForm(field, event.target.value)} />)}
      </div><textarea className="mt-3 min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="História e descrição" value={editingEntity.historia} onChange={(event) => updateForm("historia", event.target.value)} /><Input className="mt-3" placeholder="Poderes separados por vírgula" value={editingEntity.poderes.join(", ")} onChange={(event) => setEditingEntity({ ...editingEntity, poderes: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) })} /><div className="mt-3 grid gap-2 md:grid-cols-2"><label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-primary/30 p-2 text-sm text-primary"><Upload className="h-4 w-4" />Imagem principal<input type="file" accept="image/*" className="hidden" onChange={(event) => uploadMedia(event, "image")} disabled={isUploading} /></label><label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-primary/30 p-2 text-sm text-primary"><Upload className="h-4 w-4" />Sigilo<input type="file" accept="image/*" className="hidden" onChange={(event) => uploadMedia(event, "sigil")} disabled={isUploading} /></label></div>{formError && <p className="mt-3 text-sm text-red-400">{formError}</p>}<div className="mt-5 flex justify-end gap-2"><Button variant="ghost" onClick={() => setEditingEntity(null)}>Cancelar</Button><Button onClick={saveEntity} className="bg-primary text-black">Salvar</Button></div></Card></div>}
    </div>
  );
}
