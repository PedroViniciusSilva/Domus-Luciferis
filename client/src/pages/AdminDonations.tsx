import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertOctagon,
  AlertTriangle,
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Boxes,
  Calendar,
  CircleDollarSign,
  Download,
  Edit2,
  Flame,
  FolderPlus,
  History,
  Home,
  KeyRound,
  Layers,
  Lock,
  Minus,
  Plus,
  Search,
  ShieldAlert,
  Trash2,
  TrendingDown,
  TrendingUp,
  Unlock,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";

export type CategoryConfig = {
  name: string;
  desc: string;
  subcategories: string[];
};

export type InventoryItem = {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  colorVariant?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  historicalTotalInvested: number;
  minQuantityAlert: number;
  location?: string;
};

export type MovementType = "ENTRADA" | "SAIDA_USO" | "SAIDA_AVARIA";

export type StockMovement = {
  id: string;
  itemId: string;
  itemName: string;
  category: string;
  subcategory: string;
  type: MovementType;
  amount: number;
  unitPrice: number;
  totalValue: number;
  reason: string;
  responsible?: string;
  dateIso: string;
  timestamp: string;
};

const DEFAULT_CATEGORIES: CategoryConfig[] = [
  {
    name: "Velas & Fogo",
    desc: "Velas de 7 dias, palito, artesanais, lamparinas e pavios de consagração.",
    subcategories: ["Velas de 7 Dias", "Vela Palito", "Vela Artesanal", "Vela Votiva", "Lamparina / Óleo"],
  },
  {
    name: "Defumações, Resinas & Ervas",
    desc: "Mirra, benjoim, olíbano, incensos varetas/cones e carvões de queima.",
    subcategories: ["Resinas", "Ervas Secas", "Carvão", "Incensos em Vareta", "Incensos em Cone", "Defumadores em Pó"],
  },
  {
    name: "Bebidas & Libações",
    desc: "Vinhos tintos, destilados, uísque, cachaça, licores e azeites ritualísticos.",
    subcategories: ["Vinhos", "Destilados / Cachaça / Uísque", "Licores", "Azeites Telúricos", "Águas Consagradas"],
  },
  {
    name: "Paramentos & Altares",
    desc: "Taças, cálices, athames, caldeirões, estátuas e toalhas cerimoniais.",
    subcategories: ["Taças & Cálice", "Punhais / Athames", "Caldeirões & Queimadores", "Toalhas & Tecidos", "Estátuas & Imagens"],
  },
  {
    name: "Consumíveis & Limpeza",
    desc: "Sal grosso, água de alfazema, pembas, fósforos e insumos de apoio.",
    subcategories: ["Sal Grosso", "Água de Alfazema", "Pembas", "Fósforos / Isqueiros", "Sacos para Oferendas"],
  },
];

const DEFAULT_ITEMS: InventoryItem[] = [
  {
    id: "item-1",
    name: "Vela 7 Dias Bicolor",
    category: "Velas & Fogo",
    subcategory: "Velas de 7 Dias",
    colorVariant: "Preta e Vermelha",
    quantity: 14,
    unit: "un",
    unitPrice: 12.5,
    totalPrice: 175.0,
    historicalTotalInvested: 175.0,
    minQuantityAlert: 10,
    location: "Armário de Firmezas",
  },
  {
    id: "item-2",
    name: "Vela Palito Tradicional",
    category: "Velas & Fogo",
    subcategory: "Vela Palito",
    colorVariant: "Preta",
    quantity: 48,
    unit: "un",
    unitPrice: 1.5,
    totalPrice: 72.0,
    historicalTotalInvested: 72.0,
    minQuantityAlert: 30,
    location: "Gaveta 2",
  },
  {
    id: "item-3",
    name: "Vela Artesanal Cera de Abelha",
    category: "Velas & Fogo",
    subcategory: "Vela Artesanal",
    colorVariant: "Dourada / Natural",
    quantity: 4,
    unit: "un",
    unitPrice: 25.0,
    totalPrice: 100.0,
    historicalTotalInvested: 100.0,
    minQuantityAlert: 6,
    location: "Altar Principal",
  },
];

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val || 0);
};

const getTodayIso = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function AdminDonations() {
  const [, setLocation] = useLocation();

  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return Boolean(sessionStorage.getItem("domus_admin_token"));
  });
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  const [activeTab, setActiveTab] = useState<"estoque" | "historico" | "dashboard">("estoque");
  const [activeCategoryView, setActiveCategoryView] = useState<string | null>(null);

  const [categories, setCategories] = useState<CategoryConfig[]>(() => {
    const saved = localStorage.getItem("domus_inventory_categories");
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });

  const [items, setItems] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem("domus_inventory_items");
    if (!saved) return DEFAULT_ITEMS;
    try {
      const parsed: InventoryItem[] = JSON.parse(saved);
      return parsed.map((it) => ({
        ...it,
        historicalTotalInvested:
          it.historicalTotalInvested !== undefined
            ? it.historicalTotalInvested
            : (it.totalPrice ?? (it.quantity * (it.unitPrice ?? 0))),
      }));
    } catch {
      return DEFAULT_ITEMS;
    }
  });

  const [movements, setMovements] = useState<StockMovement[]>(() => {
    const saved = localStorage.getItem("domus_inventory_movements");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("domus_inventory_categories", JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem("domus_inventory_items", JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem("domus_inventory_movements", JSON.stringify(movements));
  }, [movements]);

  const [searchFilter, setSearchFilter] = useState("");

  // Filtros de Análise do Dashboard
  const [dashFilterMode, setDashFilterMode] = useState<"dia" | "mes" | "ano">("dia");
  const [dashSelectedDate, setDashSelectedDate] = useState(() => getTodayIso());
  const [dashSelectedMonth, setDashSelectedMonth] = useState(() => getTodayIso().slice(0, 7));
  const [dashSelectedYear, setDashSelectedYear] = useState(() => String(new Date().getFullYear()));

  // Modais de Itens
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [itemErrorMsg, setItemErrorMsg] = useState<string | null>(null);

  const [itemForm, setItemForm] = useState<Partial<InventoryItem>>({
    name: "",
    category: "",
    subcategory: "",
    colorVariant: "",
    quantity: 1,
    unit: "un",
    unitPrice: 0,
    totalPrice: 0,
    minQuantityAlert: 5,
    location: "",
  });

  // Modais de Categoria
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategoryOrigin, setEditingCategoryOrigin] = useState<CategoryConfig | null>(null);
  const [categoryForm, setCategoryForm] = useState<{
    name: string;
    desc: string;
    subcategoriesText: string;
  }>({
    name: "",
    desc: "",
    subcategoriesText: "",
  });

  // Modal de Movimentação
  const [movementModal, setMovementModal] = useState<{
    isOpen: boolean;
    item: InventoryItem | null;
    type: MovementType;
  }>({
    isOpen: false,
    item: null,
    type: "SAIDA_USO",
  });

  const [movementForm, setMovementForm] = useState({
    amount: 1,
    reason: "",
    responsible: "Sacerdote / Administrador",
  });

  async function handleLogin() {
    const normalizedInput = passwordInput.trim();
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: normalizedInput }),
      });
      if (!response.ok) throw new Error();
      const data = await response.json();
      sessionStorage.setItem("domus_admin_token", data.token);
      setIsAdmin(true);
      setAuthError("");
      setPasswordInput("");
    } catch {
      setAuthError("Chave de acesso administrativa incorreta.");
    }
  }

  function handleLogout() {
    setIsAdmin(false);
    sessionStorage.removeItem("domus_admin_token");
  }

  async function handleChangePassword() {
    setPasswordMessage("");
    if (newPassword !== confirmPassword) {
      setPasswordMessage("A confirmação da nova senha não confere.");
      return;
    }

    const response = await fetch("/api/admin/change-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("domus_admin_token") || ""}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await response.json();
    if (!response.ok) {
      setPasswordMessage(data.message || "Não foi possível alterar a senha.");
      return;
    }

    sessionStorage.setItem("domus_admin_token", data.token);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordMessage(data.message);
  }

  function handleOpenCreateCategory() {
    setEditingCategoryOrigin(null);
    setCategoryForm({
      name: "",
      desc: "",
      subcategoriesText: "Geral",
    });
    setShowCategoryModal(true);
  }

  function handleOpenEditCategory(cat: CategoryConfig, e?: React.MouseEvent) {
    if (e) e.stopPropagation();
    setEditingCategoryOrigin(cat);
    setCategoryForm({
      name: cat.name,
      desc: cat.desc,
      subcategoriesText: cat.subcategories.join(", "),
    });
    setShowCategoryModal(true);
  }

  function handleSaveCategory() {
    if (!categoryForm.name.trim()) return;

    const newSubcategories = categoryForm.subcategoriesText
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const formattedSubs = newSubcategories.length > 0 ? newSubcategories : ["Geral"];

    if (editingCategoryOrigin) {
      const oldCatName = editingCategoryOrigin.name;
      const newCatName = categoryForm.name.trim();
      const oldSubs = editingCategoryOrigin.subcategories;

      const subcategoryRenameMap = new Map<string, string>();
      oldSubs.forEach((oldSub, index) => {
        if (formattedSubs[index]) {
          subcategoryRenameMap.set(oldSub.toLowerCase(), formattedSubs[index]);
        }
      });

      setCategories(
        categories.map((c) =>
          c.name === oldCatName
            ? {
                name: newCatName,
                desc: categoryForm.desc.trim(),
                subcategories: formattedSubs,
              }
            : c
        )
      );

      setItems(
        items.map((it) => {
          if (it.category === oldCatName) {
            const mappedSub =
              subcategoryRenameMap.get(it.subcategory.toLowerCase()) ||
              (formattedSubs.includes(it.subcategory) ? it.subcategory : formattedSubs[0]);

            return {
              ...it,
              category: newCatName,
              subcategory: mappedSub,
            };
          }
          return it;
        })
      );

      if (activeCategoryView === oldCatName) {
        setActiveCategoryView(newCatName);
      }
    } else {
      const newCat: CategoryConfig = {
        name: categoryForm.name.trim(),
        desc: categoryForm.desc.trim(),
        subcategories: formattedSubs,
      };
      setCategories([...categories, newCat]);
    }

    setShowCategoryModal(false);
    setEditingCategoryOrigin(null);
  }

  function handleDeleteCategory(catName: string, e?: React.MouseEvent) {
    if (e) e.stopPropagation();
    const itemsCount = items.filter((it) => it.category === catName).length;

    const msg =
      itemsCount > 0
        ? `A categoria "${catName}" possui ${itemsCount} insumo(s) cadastrado(s). Deseja realmente excluir a categoria e todos os seus itens?`
        : `Deseja realmente excluir a categoria "${catName}"?`;

    if (!confirm(msg)) return;

    setCategories(categories.filter((c) => c.name !== catName));
    setItems(items.filter((it) => it.category !== catName));
    if (activeCategoryView === catName) {
      setActiveCategoryView(null);
    }
  }

  function handleOpenCreateItem(preSelectedCategory?: string) {
    setItemErrorMsg(null);
    const targetCategory = preSelectedCategory || activeCategoryView || categories[0]?.name || "Geral";
    const foundCat = categories.find((c) => c.name === targetCategory);
    const subcats = foundCat?.subcategories || ["Geral"];

    setEditingItem(null);
    setItemForm({
      name: "",
      category: targetCategory,
      subcategory: subcats[0] || "Geral",
      colorVariant: "",
      quantity: 1,
      unit: "un",
      unitPrice: 0,
      totalPrice: 0,
      minQuantityAlert: 5,
      location: "",
    });
    setShowItemModal(true);
  }

  function handleOpenEditItem(item: InventoryItem) {
    setItemErrorMsg(null);
    setEditingItem(item);
    setItemForm({
      name: item.name,
      category: item.category,
      subcategory: item.subcategory,
      colorVariant: item.colorVariant || "",
      quantity: item.quantity,
      unit: item.unit,
      unitPrice: item.unitPrice ?? 0,
      totalPrice: item.totalPrice ?? (item.quantity * (item.unitPrice ?? 0)),
      minQuantityAlert: item.minQuantityAlert,
      location: item.location || "",
    });
    setShowItemModal(true);
  }

  function handleSaveItem() {
    setItemErrorMsg(null);
    if (!itemForm.name || !itemForm.name.trim()) {
      setItemErrorMsg("O nome do item é obrigatório.");
      return;
    }
    if (!itemForm.category) {
      setItemErrorMsg("Selecione uma categoria.");
      return;
    }

    const trimmedName = itemForm.name.trim();
    const targetCategory = itemForm.category;
    const targetSubcategory = itemForm.subcategory?.trim() || "Geral";
    const targetColor = (itemForm.colorVariant || "").trim();
    const qty = Number(itemForm.quantity) || 0;
    const uPrice = Number(itemForm.unitPrice) || 0;
    const tPrice = itemForm.totalPrice && itemForm.totalPrice > 0 ? Number(itemForm.totalPrice) : qty * uPrice;

    const isDuplicate = items.some((it) => {
      if (editingItem && it.id === editingItem.id) return false;

      const sameName = it.name.trim().toLowerCase() === trimmedName.toLowerCase();
      const sameCat = it.category.trim().toLowerCase() === targetCategory.trim().toLowerCase();
      const sameSub = it.subcategory.trim().toLowerCase() === targetSubcategory.trim().toLowerCase();
      const sameColor = (it.colorVariant || "").trim().toLowerCase() === targetColor.toLowerCase();

      return sameName && sameCat && sameSub && sameColor;
    });

    if (isDuplicate) {
      setItemErrorMsg(
        `Este item (${trimmedName}${targetColor ? ` - ${targetColor}` : ""}) já está cadastrado nesta categoria e subcategoria.`
      );
      return;
    }

    if (editingItem) {
      setItems(
        items.map((it) => {
          if (it.id === editingItem.id) {
            const existingInvested =
              it.historicalTotalInvested !== undefined
                ? it.historicalTotalInvested
                : (it.totalPrice ?? (it.quantity * (it.unitPrice ?? 0)));

            return {
              ...it,
              name: trimmedName,
              category: targetCategory,
              subcategory: targetSubcategory,
              colorVariant: targetColor,
              quantity: qty,
              unit: itemForm.unit || "un",
              unitPrice: uPrice,
              totalPrice: tPrice,
              historicalTotalInvested: Math.max(existingInvested, tPrice),
              minQuantityAlert: Number(itemForm.minQuantityAlert) || 0,
              location: (itemForm.location || "").trim(),
            };
          }
          return it;
        })
      );
    } else {
      const newItem: InventoryItem = {
        id: `item-${Date.now()}`,
        name: trimmedName,
        category: targetCategory,
        subcategory: targetSubcategory,
        colorVariant: targetColor,
        quantity: qty,
        unit: itemForm.unit || "un",
        unitPrice: uPrice,
        totalPrice: tPrice,
        historicalTotalInvested: tPrice,
        minQuantityAlert: Number(itemForm.minQuantityAlert) || 5,
        location: itemForm.location?.trim() || "Santuário",
      };
      setItems([newItem, ...items]);
    }

    setShowItemModal(false);
    setEditingItem(null);
    setItemErrorMsg(null);
  }

  function handleDeleteItem(id: string) {
    if (!confirm("Deseja realmente remover este item do inventário? O valor dele será removido do investimento total.")) return;
    setItems(items.filter((it) => it.id !== id));
  }

  function handleDeleteMovement(movementId: string) {
    if (!confirm("Deseja remover este registro de movimentação do histórico?")) return;
    setMovements(movements.filter((m) => m.id !== movementId));
  }

  function handleExecuteMovement() {
    const { item, type } = movementModal;
    if (!item) return;

    const amount = Math.max(1, Number(movementForm.amount) || 1);
    const newQuantity =
      type === "ENTRADA" ? item.quantity + amount : Math.max(0, item.quantity - amount);

    const uPrice = item.unitPrice ?? 0;
    const newTotalPrice = newQuantity * uPrice;
    const movementTotalValue = amount * uPrice;

    setItems(
      items.map((it) =>
        it.id === item.id
          ? {
              ...it,
              quantity: newQuantity,
              totalPrice: newTotalPrice,
              historicalTotalInvested:
                (it.historicalTotalInvested || 0) + (type === "ENTRADA" ? movementTotalValue : 0),
            }
          : it
      )
    );

    const todayDate = new Date();
    const dateIso = getTodayIso();

    const newMovement: StockMovement = {
      id: `mov-${Date.now()}`,
      itemId: item.id,
      itemName: `${item.name} ${item.colorVariant ? `(${item.colorVariant})` : ""}`.trim(),
      category: item.category,
      subcategory: item.subcategory,
      type,
      amount,
      unitPrice: uPrice,
      totalValue: movementTotalValue,
      reason:
        movementForm.reason.trim() ||
        (type === "ENTRADA"
          ? "Compra / Reposição"
          : type === "SAIDA_AVARIA"
          ? "Quebra / Perda / Avaria"
          : "Uso Cerimonial / Ritual"),
      responsible: movementForm.responsible.trim() || "Sacerdote",
      dateIso,
      timestamp:
        todayDate.toLocaleDateString("pt-BR") +
        " " +
        todayDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    };

    setMovements([newMovement, ...movements]);
    setMovementModal({ isOpen: false, item: null, type: "SAIDA_USO" });
    setMovementForm({ amount: 1, reason: "", responsible: "Sacerdote / Administrador" });
  }

  function exportInventoryCsv() {
    const headers = [
      "ID",
      "Item",
      "Categoria",
      "Subcategoria",
      "Variacao_Cor",
      "Qtd_Atual",
      "Unidade",
      "Valor_Unitario",
      "Valor_Total",
      "Investimento_Historico_Gravado",
      "Minimo_Alerta",
      "Status",
      "Localizacao",
    ];

    const rows = items.map((it) => [
      `"${it.id}"`,
      `"${it.name.replace(/"/g, '""')}"`,
      `"${it.category}"`,
      `"${it.subcategory}"`,
      `"${it.colorVariant || ""}"`,
      `"${it.quantity}"`,
      `"${it.unit}"`,
      `"${(it.unitPrice ?? 0).toFixed(2)}"`,
      `"${(it.totalPrice ?? it.quantity * (it.unitPrice ?? 0)).toFixed(2)}"`,
      `"${(it.historicalTotalInvested ?? it.totalPrice).toFixed(2)}"`,
      `"${it.minQuantityAlert}"`,
      `"${it.quantity <= it.minQuantityAlert ? "CRITICO / REPOSICAO" : "NORMAL"}"`,
      `"${it.location || ""}"`,
    ]);

    const csvContent = "\uFEFF" + [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `inventario_domus_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const categoryItems = useMemo(() => {
    if (!activeCategoryView) return [];
    return items.filter((it) => {
      const matchesCategory = it.category === activeCategoryView;
      const matchesSearch =
        it.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        (it.colorVariant || "").toLowerCase().includes(searchFilter.toLowerCase()) ||
        it.subcategory.toLowerCase().includes(searchFilter.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [items, activeCategoryView, searchFilter]);

  const criticalItemsCount = useMemo(() => {
    return items.filter((it) => it.quantity <= it.minQuantityAlert).length;
  }, [items]);

  const totalInventoryValue = useMemo(() => {
    return items.reduce((acc, it) => acc + (it.totalPrice ?? it.quantity * (it.unitPrice ?? 0)), 0);
  }, [items]);

  const totalHistoricoCompras = useMemo(() => {
    return items.reduce((acc, it) => {
      const valorGravado =
        it.historicalTotalInvested !== undefined
          ? it.historicalTotalInvested
          : (it.totalPrice ?? (it.quantity * (it.unitPrice ?? 0)));
      return acc + valorGravado;
    }, 0);
  }, [items]);

  const filteredDashboardMovements = useMemo(() => {
    return movements.filter((m) => {
      const dateToMatch = m.dateIso || getTodayIso();

      if (dashFilterMode === "dia") {
        return dateToMatch === dashSelectedDate;
      }
      if (dashFilterMode === "mes") {
        return dateToMatch.startsWith(dashSelectedMonth);
      }
      if (dashFilterMode === "ano") {
        return dateToMatch.startsWith(dashSelectedYear);
      }
      return true;
    });
  }, [movements, dashFilterMode, dashSelectedDate, dashSelectedMonth, dashSelectedYear]);

  const dashboardStats = useMemo(() => {
    let totalGastoUso = 0;
    let qtdGastoUso = 0;
    let totalGastoAvaria = 0;
    let qtdGastoAvaria = 0;
    let totalEntradas = 0;
    let qtdEntradas = 0;

    const usoPorItemMap = new Map<string, { name: string; amount: number; value: number }>();
    const avariaPorItemMap = new Map<string, { name: string; amount: number; value: number; reason: string }>();

    filteredDashboardMovements.forEach((m) => {
      const val = m.totalValue || 0;

      if (m.type === "SAIDA_USO" || (m.type as any) === "SAIDA") {
        totalGastoUso += val;
        qtdGastoUso += m.amount;

        const curr = usoPorItemMap.get(m.itemName) || { name: m.itemName, amount: 0, value: 0 };
        curr.amount += m.amount;
        curr.value += val;
        usoPorItemMap.set(m.itemName, curr);
      } else if (m.type === "SAIDA_AVARIA") {
        totalGastoAvaria += val;
        qtdGastoAvaria += m.amount;

        const curr = avariaPorItemMap.get(m.itemName) || { name: m.itemName, amount: 0, value: 0, reason: m.reason };
        curr.amount += m.amount;
        curr.value += val;
        avariaPorItemMap.set(m.itemName, curr);
      } else if (m.type === "ENTRADA") {
        totalEntradas += val;
        qtdEntradas += m.amount;
      }
    });

    const topUso = Array.from(usoPorItemMap.values()).sort((a, b) => b.value - a.value);
    const topAvarias = Array.from(avariaPorItemMap.values()).sort((a, b) => b.value - a.value);

    return {
      totalGastoUso,
      qtdGastoUso,
      totalGastoAvaria,
      qtdGastoAvaria,
      totalEntradas,
      qtdEntradas,
      totalPrejuizoGeral: totalGastoUso + totalGastoAvaria,
      topUso,
      topAvarias,
    };
  }, [filteredDashboardMovements]);

  if (!isAdmin) {
    return (
      <div className="container mx-auto flex min-h-[75vh] items-center justify-center px-4 py-16">
        <Card className="w-full max-w-md border-primary/30 bg-zinc-950/95 p-6 shadow-[0_0_50px_rgba(212,175,55,0.1)]">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-primary/40 bg-primary/10">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="font-cinzel text-xl text-primary uppercase tracking-wider">
              Painel Administrativo
            </CardTitle>
            <p className="text-xs text-zinc-400 mt-1">
              Área restrita de gestão de inventário e insumos do templo.
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs text-zinc-400 block mb-1 font-cinzel uppercase tracking-wider">
                Chave de Acesso:
              </Label>
              <Input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleLogin();
                }}
                placeholder="Digite a senha de administrador..."
                className="bg-black/60 border-primary/20 text-xs h-11"
              />
              {authError && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-red-400">
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}
            </div>

            <Button
              onClick={handleLogin}
              className="w-full bg-primary font-cinzel text-xs uppercase font-bold text-black hover:bg-white h-11 tracking-widest"
            >
              Entrar no Painel
            </Button>

            <div className="pt-2 text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/")}
                className="text-xs text-zinc-500 hover:text-primary"
              >
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Voltar para o Início
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Topo */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-primary/20 pb-4">
        <div className="flex gap-3">
          <Button
            onClick={() => {
              if (activeCategoryView) {
                setActiveCategoryView(null);
                setSearchFilter("");
              } else {
                setLocation("/");
              }
            }}
            variant="ghost"
            size="sm"
            className="border border-primary/20 text-primary hover:bg-primary/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {activeCategoryView ? "Categorias" : "Home"}
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => { setPasswordMessage(""); setShowPasswordModal(true); }}
            variant="outline"
            size="sm"
            className="border-primary/30 text-primary"
          >
            <KeyRound className="mr-1.5 h-3.5 w-3.5" /> Alterar senha
          </Button>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="border-red-500/30 bg-red-500/10 font-cinzel text-xs uppercase tracking-wider text-red-400 hover:bg-red-500/20"
          >
            <Unlock className="mr-1.5 h-3.5 w-3.5" /> Sair do Admin
          </Button>
        </div>
      </div>

      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-md border-primary/40 bg-zinc-950 p-6 text-zinc-200">
            <CardTitle className="mb-5 font-cinzel text-lg text-primary">Alterar senha</CardTitle>
            <div className="space-y-3">
              <Input type="password" placeholder="Senha atual" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
              <Input type="password" placeholder="Nova senha (mínimo 8 caracteres)" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              <Input type="password" placeholder="Confirme a nova senha" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              {passwordMessage && <p className="text-xs text-primary">{passwordMessage}</p>}
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setShowPasswordModal(false)}>Cancelar</Button>
                <Button onClick={handleChangePassword} className="bg-primary text-black">Salvar nova senha</Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Título Principal */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-primary/60">Santuário Domus Luciferis</p>
          <h1 className="font-cinzel text-3xl text-primary flex items-center gap-2 mt-1">
            <Boxes className="h-7 w-7 text-primary" /> Estoque & Insumos por Categoria
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={exportInventoryCsv}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-cinzel text-xs flex items-center gap-1.5"
          >
            <Download className="h-3.5 w-3.5" /> Exportar Planilha
          </Button>
          {!activeCategoryView ? (
            <Button
              size="sm"
              onClick={handleOpenCreateCategory}
              className="bg-primary text-black font-cinzel text-xs uppercase font-bold hover:bg-white flex items-center gap-1"
            >
              <FolderPlus className="h-4 w-4" /> Nova Categoria
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => handleOpenCreateItem(activeCategoryView)}
              className="bg-primary text-black font-cinzel text-xs uppercase font-bold hover:bg-white flex items-center gap-1"
            >
              <Plus className="h-4 w-4" /> Novo Insumo
            </Button>
          )}
        </div>
      </div>

      {/* Abas */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 border-b border-primary/20 pb-3">
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={activeTab === "estoque" ? "default" : "outline"}
            onClick={() => setActiveTab("estoque")}
            className={`font-cinzel text-xs uppercase tracking-wider ${
              activeTab === "estoque" ? "bg-primary text-black font-bold" : "border-primary/20 text-zinc-400"
            }`}
          >
            <Layers className="h-4 w-4 mr-1.5" /> Categorias ({categories.length})
            {criticalItemsCount > 0 && (
              <span className="ml-2 rounded bg-red-500 px-1.5 py-0.2 text-[10px] text-white font-bold">
                {criticalItemsCount} crítico(s)
              </span>
            )}
          </Button>

          <Button
            size="sm"
            variant={activeTab === "historico" ? "default" : "outline"}
            onClick={() => setActiveTab("historico")}
            className={`font-cinzel text-xs uppercase tracking-wider ${
              activeTab === "historico" ? "bg-primary text-black font-bold" : "border-primary/20 text-zinc-400"
            }`}
          >
            <History className="h-4 w-4 mr-1.5" /> Livro de Movimentações ({movements.length})
          </Button>

          <Button
            size="sm"
            variant={activeTab === "dashboard" ? "default" : "outline"}
            onClick={() => setActiveTab("dashboard")}
            className={`font-cinzel text-xs uppercase tracking-wider ${
              activeTab === "dashboard"
                ? "bg-amber-400 text-black font-bold border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.2)]"
                : "border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
            }`}
          >
            <BarChart3 className="h-4 w-4 mr-1.5" /> Dashboard de Gastos & Avarias
          </Button>
        </div>

        <div className="flex items-center gap-2 rounded border border-primary/20 bg-black/60 px-3 py-1.5 text-xs">
          <CircleDollarSign className="h-4 w-4 text-emerald-400" />
          <span className="text-zinc-400">Patrimônio em Estoque:</span>
          <span className="font-cinzel font-bold text-emerald-400">{formatCurrency(totalInventoryValue)}</span>
        </div>
      </div>

      {/* ========================================================
          ABA 1: VISÃO DE CATEGORIAS OU ITENS DA CATEGORIA
         ======================================================== */}
      {activeTab === "estoque" && (
        <>
          {!activeCategoryView ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((cat) => {
                const catItems = items.filter((it) => it.category === cat.name);
                const hasCritical = catItems.some((it) => it.quantity <= it.minQuantityAlert);
                const catTotalValue = catItems.reduce(
                  (acc, it) => acc + (it.totalPrice ?? it.quantity * (it.unitPrice ?? 0)),
                  0
                );

                return (
                  <Card
                    key={cat.name}
                    onClick={() => {
                      setActiveCategoryView(cat.name);
                      setSearchFilter("");
                    }}
                    className={`group cursor-pointer overflow-hidden border bg-zinc-950/90 p-6 transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between relative ${
                      hasCritical
                        ? "border-red-500/50 shadow-[0_0_25px_rgba(239,68,68,0.15)] hover:border-red-500"
                        : "border-primary/20 hover:border-primary/60 hover:shadow-[0_0_30px_rgba(212,175,55,0.12)]"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-black">
                          <Boxes className="h-6 w-6" />
                        </div>

                        <div className="flex items-center gap-1.5">
                          {hasCritical && (
                            <span className="flex items-center gap-1 rounded bg-red-500/20 px-2 py-0.5 text-[10px] font-bold text-red-400 border border-red-500/30 mr-1">
                              <AlertTriangle className="h-3 w-3" /> Reposição
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={(e) => handleOpenEditCategory(cat, e)}
                            className="p-1.5 rounded text-zinc-400 hover:text-primary hover:bg-black/60 transition-colors"
                            title="Editar Categoria"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteCategory(cat.name, e)}
                            className="p-1.5 rounded text-zinc-500 hover:text-red-400 hover:bg-black/60 transition-colors"
                            title="Excluir Categoria"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <h3 className="font-cinzel text-lg font-bold text-zinc-100 group-hover:text-primary transition-colors">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-zinc-400 mt-1.5 line-clamp-2 leading-relaxed">
                        {cat.desc || "Sem descrição informada."}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-1">
                        {cat.subcategories.slice(0, 3).map((sub) => (
                          <span
                            key={sub}
                            className="rounded bg-black/60 px-2 py-0.5 text-[10px] text-zinc-400 border border-primary/10"
                          >
                            {sub}
                          </span>
                        ))}
                        {cat.subcategories.length > 3 && (
                          <span className="text-[10px] text-zinc-500 self-center">
                            +{cat.subcategories.length - 3}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-primary/10 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-zinc-400 font-cinzel block">
                          <strong>{catItems.length}</strong> {catItems.length === 1 ? "item" : "itens"}
                        </span>
                        <span className="text-[11px] text-emerald-400 font-mono font-semibold">
                          {formatCurrency(catTotalValue)}
                        </span>
                      </div>
                      <span className="font-cinzel font-bold text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Abrir <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-zinc-950 p-4 rounded-lg border border-primary/20">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setActiveCategoryView(null);
                      setSearchFilter("");
                    }}
                    className="text-primary hover:bg-primary/10 border border-primary/20 h-9"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1.5" /> Voltar
                  </Button>
                  <h2 className="font-cinzel text-lg text-primary font-bold ml-1">
                    {activeCategoryView}
                  </h2>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                  <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                    <Input
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      placeholder="Buscar item nesta categoria..."
                      className="pl-9 bg-black/60 border-primary/20 text-xs h-9"
                    />
                  </div>

                  <Button
                    size="sm"
                    onClick={() => handleOpenCreateItem(activeCategoryView)}
                    className="bg-primary text-black font-cinzel text-xs uppercase font-bold hover:bg-white h-9 shrink-0 w-full sm:w-auto"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar Item
                  </Button>
                </div>
              </div>

              {/* Tabela de Itens */}
              <Card className="border-primary/20 bg-zinc-950/95 overflow-hidden shadow-[0_0_30px_rgba(212,175,55,0.05)]">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-zinc-300">
                    <thead className="border-b border-primary/20 bg-black/80 font-cinzel text-[11px] uppercase tracking-wider text-primary">
                      <tr>
                        <th className="p-3.5">Item</th>
                        <th className="p-3.5">Subcategoria</th>
                        <th className="p-3.5">Cor / Especificação</th>
                        <th className="p-3.5">Localização</th>
                        <th className="p-3.5 text-center">Saldo</th>
                        <th className="p-3.5 text-right">Valor Unit.</th>
                        <th className="p-3.5 text-right">Valor Total</th>
                        <th className="p-3.5 text-center">Status</th>
                        <th className="p-3.5 text-right">Ações Rápidas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-primary/10">
                      {categoryItems.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="p-8 text-center text-zinc-500 font-cinzel">
                            Nenhum insumo encontrado nesta categoria.
                          </td>
                        </tr>
                      ) : (
                        categoryItems.map((item) => {
                          const isCritical = item.quantity <= item.minQuantityAlert;
                          const uPrice = item.unitPrice ?? 0;
                          const tPrice = item.totalPrice ?? item.quantity * uPrice;

                          return (
                            <tr
                              key={item.id}
                              className={`transition-colors hover:bg-primary/5 ${
                                isCritical ? "bg-red-500/5" : ""
                              }`}
                            >
                              <td className="p-3.5 font-semibold text-zinc-100 font-cinzel text-sm">
                                {item.name}
                              </td>
                              <td className="p-3.5">
                                <span className="rounded bg-black/60 px-2 py-0.5 text-[11px] text-zinc-300 border border-primary/10">
                                  {item.subcategory}
                                </span>
                              </td>
                              <td className="p-3.5 text-amber-300/80 font-mono">
                                {item.colorVariant || "—"}
                              </td>
                              <td className="p-3.5 text-zinc-400">
                                {item.location || "Santuário"}
                              </td>
                              <td className="p-3.5 text-center">
                                <span
                                  className={`text-base font-cinzel font-bold ${
                                    isCritical ? "text-red-400" : "text-primary"
                                  }`}
                                >
                                  {item.quantity}
                                </span>{" "}
                                <span className="text-[10px] text-zinc-500">{item.unit}</span>
                              </td>
                              <td className="p-3.5 text-right font-mono text-zinc-300">
                                {formatCurrency(uPrice)}
                              </td>
                              <td className="p-3.5 text-right font-mono font-bold text-emerald-400">
                                {formatCurrency(tPrice)}
                              </td>
                              <td className="p-3.5 text-center">
                                {isCritical ? (
                                  <span className="inline-flex items-center gap-1 rounded bg-red-500/20 px-2 py-0.5 text-[10px] font-bold text-red-400 border border-red-500/30">
                                    <AlertTriangle className="h-3 w-3" /> Repor (&le;{item.minQuantityAlert})
                                  </span>
                                ) : (
                                  <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400 border border-emerald-500/20">
                                    Normal
                                  </span>
                                )}
                              </td>
                              <td className="p-3.5 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      setMovementModal({ isOpen: true, item, type: "ENTRADA" });
                                      setMovementForm({ amount: 1, reason: "Compra / Reposição", responsible: "Sacerdote" });
                                    }}
                                    className="h-7 bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-600/30 text-[11px] font-cinzel px-2"
                                    title="Lançar Entrada"
                                  >
                                    <Plus className="h-3 w-3 mr-0.5" /> Entrada
                                  </Button>

                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      setMovementModal({ isOpen: true, item, type: "SAIDA_USO" });
                                      setMovementForm({ amount: 1, reason: "Uso em Ritual", responsible: "Sacerdote" });
                                    }}
                                    className="h-7 bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:bg-amber-500/30 text-[11px] font-cinzel px-2"
                                    title="Dar Baixa / Uso"
                                  >
                                    <Minus className="h-3 w-3 mr-0.5" /> Baixa
                                  </Button>

                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handleOpenEditItem(item)}
                                    className="h-7 w-7 text-zinc-400 hover:text-primary"
                                    title="Editar"
                                  >
                                    <Edit2 className="h-3.5 w-3.5" />
                                  </Button>

                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handleDeleteItem(item.id)}
                                    className="h-7 w-7 text-zinc-500 hover:text-red-400"
                                    title="Excluir"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}
        </>
      )}

      {/* ========================================================
          ABA 2: LIVRO CAIXA DE MOVIMENTAÇÕES
         ======================================================== */}
      {activeTab === "historico" && (
        <Card className="border-primary/20 bg-zinc-950/95 overflow-hidden">
          <div className="flex items-center justify-between border-b border-primary/15 p-4 bg-black/60">
            <div>
              <h3 className="font-cinzel text-sm text-primary flex items-center gap-2">
                <History className="h-4 w-4" /> Linha de Auditoria de Entradas e Saídas
              </h3>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Histórico permanente de movimentações com exclusão individual auditada.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="border-b border-primary/10 bg-black/40 font-cinzel text-[10px] uppercase text-zinc-400">
                <tr>
                  <th className="p-3">Data / Hora</th>
                  <th className="p-3">Tipo</th>
                  <th className="p-3">Item</th>
                  <th className="p-3">Categoria</th>
                  <th className="p-3">Qtd</th>
                  <th className="p-3 text-right">Valor Total</th>
                  <th className="p-3">Motivo / Ritual</th>
                  <th className="p-3">Responsável</th>
                  <th className="p-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5">
                {movements.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-zinc-500">
                      Nenhuma movimentação registrada.
                    </td>
                  </tr>
                ) : (
                  movements.map((mov) => (
                    <tr key={mov.id} className="hover:bg-primary/5">
                      <td className="p-3 text-zinc-400 font-mono text-[11px]">{mov.timestamp}</td>
                      <td className="p-3">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[9px] font-bold font-cinzel uppercase ${
                            mov.type === "ENTRADA"
                              ? "bg-emerald-500/20 text-emerald-300"
                              : mov.type === "SAIDA_AVARIA"
                              ? "bg-red-500/20 text-red-300 border border-red-500/30"
                              : "bg-amber-500/20 text-amber-300"
                          }`}
                        >
                          {mov.type === "ENTRADA"
                            ? "+ Entrada"
                            : mov.type === "SAIDA_AVARIA"
                            ? "⚠ Avaria"
                            : "- Baixa"}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-zinc-200">{mov.itemName}</td>
                      <td className="p-3 text-zinc-400 text-[11px]">{mov.category}</td>
                      <td
                        className={`p-3 font-cinzel font-bold text-sm ${
                          mov.type === "ENTRADA"
                            ? "text-emerald-400"
                            : mov.type === "SAIDA_AVARIA"
                            ? "text-red-400"
                            : "text-amber-400"
                        }`}
                      >
                        {mov.type === "ENTRADA" ? `+${mov.amount}` : `-${mov.amount}`}
                      </td>
                      <td className="p-3 text-right font-mono text-zinc-300 font-semibold">
                        {formatCurrency(mov.totalValue || 0)}
                      </td>
                      <td className="p-3 text-zinc-300">{mov.reason}</td>
                      <td className="p-3 text-zinc-400">{mov.responsible}</td>
                      <td className="p-3 text-right">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteMovement(mov.id)}
                          className="h-7 w-7 text-zinc-500 hover:text-red-400"
                          title="Excluir este registro do histórico"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ========================================================
          ABA 3: DASHBOARD TOTALIZADO COM TOTAL HISTÓRICO DE COMPRAS
         ======================================================== */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          {/* Seletor Temporal */}
          <Card className="border-primary/20 bg-zinc-950/90 p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-amber-400" />
                <span className="font-cinzel text-sm font-bold text-zinc-200 uppercase">
                  Período de Análise:
                </span>
                <div className="flex rounded border border-primary/20 bg-black/60 p-1">
                  <button
                    type="button"
                    onClick={() => setDashFilterMode("dia")}
                    className={`px-3 py-1 text-xs font-cinzel rounded ${
                      dashFilterMode === "dia" ? "bg-amber-400 text-black font-bold" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    Por Dia
                  </button>
                  <button
                    type="button"
                    onClick={() => setDashFilterMode("mes")}
                    className={`px-3 py-1 text-xs font-cinzel rounded ${
                      dashFilterMode === "mes" ? "bg-amber-400 text-black font-bold" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    Por Mês
                  </button>
                  <button
                    type="button"
                    onClick={() => setDashFilterMode("ano")}
                    className={`px-3 py-1 text-xs font-cinzel rounded ${
                      dashFilterMode === "ano" ? "bg-amber-400 text-black font-bold" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    Por Ano
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {dashFilterMode === "dia" && (
                  <Input
                    type="date"
                    value={dashSelectedDate}
                    onChange={(e) => setDashSelectedDate(e.target.value)}
                    className="h-9 bg-black/60 border-primary/30 text-xs w-full sm:w-44"
                  />
                )}
                {dashFilterMode === "mes" && (
                  <Input
                    type="month"
                    value={dashSelectedMonth}
                    onChange={(e) => setDashSelectedMonth(e.target.value)}
                    className="h-9 bg-black/60 border-primary/30 text-xs w-full sm:w-44"
                  />
                )}
                {dashFilterMode === "ano" && (
                  <select
                    value={dashSelectedYear}
                    onChange={(e) => setDashSelectedYear(e.target.value)}
                    className="h-9 rounded-md border border-primary/30 bg-black/60 px-3 text-xs text-zinc-200 w-full sm:w-36"
                  >
                    {[2024, 2025, 2026, 2027, 2028].map((y) => (
                      <option key={y} value={String(y)}>
                        Ano {y}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </Card>

          {/* Quadros de Visualização Totalizados */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Consumo em Rituais */}
            <Card className="border-amber-500/30 bg-zinc-950/90 p-5 shadow-[0_0_20px_rgba(245,158,11,0.06)]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-cinzel uppercase text-zinc-400">Consumo em Rituais</span>
                <Flame className="h-4 w-4 text-amber-400" />
              </div>
              <span className="text-2xl font-cinzel font-bold text-amber-400 block mt-2">
                {formatCurrency(dashboardStats.totalGastoUso)}
              </span>
              <span className="text-[11px] text-zinc-500 mt-1 block">
                {dashboardStats.qtdGastoUso} itens consumidos no período
              </span>
            </Card>

            {/* Total em Avarias / Perdas */}
            <Card className="border-red-500/40 bg-red-500/5 p-5 shadow-[0_0_20px_rgba(239,68,68,0.08)]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-cinzel uppercase text-red-400 font-bold">Total em Avarias / Perdas</span>
                <AlertOctagon className="h-4 w-4 text-red-400" />
              </div>
              <span className="text-2xl font-cinzel font-bold text-red-400 block mt-2">
                {formatCurrency(dashboardStats.totalGastoAvaria)}
              </span>
              <span className="text-[11px] text-red-300/70 mt-1 block">
                {dashboardStats.qtdGastoAvaria} itens avariados / quebrados
              </span>
            </Card>

            {/* Compras / Reposições (TOTAL HISTÓRICO DE INVESTIMENTO) */}
            <Card className="border-emerald-500/40 bg-emerald-500/5 p-5 shadow-[0_0_20px_rgba(16,185,129,0.08)]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-cinzel uppercase text-emerald-300 font-bold">
                  Compras / Investimento Total
                </span>
                <TrendingUp className="h-4 w-4 text-emerald-400" />
              </div>
              <span className="text-2xl font-cinzel font-bold text-emerald-400 block mt-2">
                {formatCurrency(totalHistoricoCompras)}
              </span>
              <div className="text-[11px] text-zinc-400 mt-1 space-y-0.5">
                <span className="block text-emerald-300/80">
                  Total de tudo que foi cadastrado e comprado
                </span>
                {dashboardStats.totalEntradas > 0 && (
                  <span className="block text-[10px] text-zinc-500">
                    No período: +{formatCurrency(dashboardStats.totalEntradas)} ({dashboardStats.qtdEntradas} un)
                  </span>
                )}
              </div>
            </Card>

            {/* Total de Saídas Acumulado */}
            <Card className="border-primary/20 bg-zinc-950/90 p-5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-cinzel uppercase text-zinc-400">Total de Saídas Acumulado</span>
                <TrendingDown className="h-4 w-4 text-primary" />
              </div>
              <span className="text-2xl font-cinzel font-bold text-primary block mt-2">
                {formatCurrency(dashboardStats.totalPrejuizoGeral)}
              </span>
              <span className="text-[11px] text-zinc-500 mt-1 block">
                {dashboardStats.qtdGastoUso + dashboardStats.qtdGastoAvaria} itens retirados no período
              </span>
            </Card>
          </div>

          {/* Quadros de Detalhamento dos Itens do Período */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-primary/20 bg-zinc-950/95 p-5">
              <div className="flex items-center gap-2 border-b border-primary/15 pb-3 mb-4">
                <Flame className="h-4 w-4 text-amber-400" />
                <h3 className="font-cinzel text-sm font-bold text-zinc-200">
                  Itens Consumidos (Rituais / Firmezas)
                </h3>
              </div>

              {dashboardStats.topUso.length === 0 ? (
                <p className="text-xs text-zinc-500 py-8 text-center">Nenhum consumo no período selecionado.</p>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {dashboardStats.topUso.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded border border-primary/10 bg-black/60 p-2.5 text-xs"
                    >
                      <div>
                        <span className="font-semibold text-zinc-200 font-cinzel">{item.name}</span>
                        <span className="text-[11px] text-zinc-500 block">{item.amount} unidades consumidas</span>
                      </div>
                      <span className="font-mono font-bold text-amber-400">{formatCurrency(item.value)}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="border-red-500/30 bg-zinc-950/95 p-5">
              <div className="flex items-center gap-2 border-b border-red-500/20 pb-3 mb-4">
                <AlertOctagon className="h-4 w-4 text-red-400" />
                <h3 className="font-cinzel text-sm font-bold text-red-400">
                  Itens com Avarias & Quebras
                </h3>
              </div>

              {dashboardStats.topAvarias.length === 0 ? (
                <p className="text-xs text-zinc-500 py-8 text-center">Nenhuma avaria registrada neste período.</p>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {dashboardStats.topAvarias.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded border border-red-500/20 bg-red-500/5 p-2.5 text-xs"
                    >
                      <div>
                        <span className="font-semibold text-zinc-200 font-cinzel">{item.name}</span>
                        <span className="text-[11px] text-red-300/70 block">
                          {item.amount} unidades • {item.reason}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-red-400">{formatCurrency(item.value)}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* MODAL DE CRIAR / EDITAR CATEGORIA */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-md border-primary/40 bg-zinc-950 p-6 text-zinc-200">
            <div className="flex items-center justify-between border-b border-primary/20 pb-3 mb-4">
              <h3 className="font-cinzel text-lg text-primary flex items-center gap-2">
                <FolderPlus className="h-5 w-5" />
                {editingCategoryOrigin ? "Editar Categoria & Subcategorias" : "Nova Categoria"}
              </h3>
              <button
                type="button"
                onClick={() => setShowCategoryModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <Label className="text-zinc-400">Nome da Categoria *</Label>
                <Input
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="Ex: Velas & Fogo, Cristais & Pedras, Livros..."
                  className="bg-black/60 border-primary/20 text-xs mt-1"
                />
              </div>

              <div>
                <Label className="text-zinc-400">Descrição</Label>
                <Textarea
                  value={categoryForm.desc}
                  onChange={(e) => setCategoryForm({ ...categoryForm, desc: e.target.value })}
                  placeholder="Breve descrição dos tipos de itens pertencentes a esta categoria..."
                  rows={2}
                  className="bg-black/60 border-primary/20 text-xs mt-1"
                />
              </div>

              <div>
                <Label className="text-zinc-400">Subcategorias / Agrupamentos (Separadas por vírgula) *</Label>
                <Input
                  value={categoryForm.subcategoriesText}
                  onChange={(e) => setCategoryForm({ ...categoryForm, subcategoriesText: e.target.value })}
                  placeholder="Ex: 7 Dias, Palito, Artesanal, Bruta, Lapidada..."
                  className="bg-black/60 border-primary/20 text-xs mt-1"
                />
                <span className="text-[10px] text-amber-300/80 mt-1 block">
                  * Ao alterar os nomes das subcategorias, os itens já cadastrados serão atualizados automaticamente.
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCategoryModal(false)}
                className="border-primary/20 text-xs"
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleSaveCategory}
                className="bg-primary text-black font-cinzel text-xs uppercase font-bold hover:bg-white"
              >
                {editingCategoryOrigin ? "Salvar Alterações" : "Criar Categoria"}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* MODAL DE MOVIMENTAÇÃO */}
      {movementModal.isOpen && movementModal.item && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-md border-primary/40 bg-zinc-950 p-6 text-zinc-200">
            <div className="flex items-center justify-between border-b border-primary/20 pb-3 mb-4">
              <h3 className="font-cinzel text-lg text-primary flex items-center gap-2">
                {movementModal.type === "ENTRADA" ? (
                  <ArrowUpRight className="h-5 w-5 text-emerald-400" />
                ) : movementModal.type === "SAIDA_AVARIA" ? (
                  <AlertOctagon className="h-5 w-5 text-red-400" />
                ) : (
                  <ArrowDownRight className="h-5 w-5 text-amber-400" />
                )}
                {movementModal.type === "ENTRADA" ? "Registrar Entrada / Compra" : "Registrar Baixa / Saída"}
              </h3>
              <button
                type="button"
                onClick={() => setMovementModal({ isOpen: false, item: null, type: "SAIDA_USO" })}
                className="text-zinc-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="rounded border border-primary/10 bg-black/50 p-3">
                <span className="text-[10px] uppercase font-cinzel text-zinc-400 block">Item:</span>
                <p className="text-sm font-cinzel font-bold text-zinc-100">
                  {movementModal.item.name} {movementModal.item.colorVariant ? `(${movementModal.item.colorVariant})` : ""}
                </p>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Saldo Atual: {movementModal.item.quantity} {movementModal.item.unit} | Unitário:{" "}
                  {formatCurrency(movementModal.item.unitPrice ?? 0)}
                </p>
              </div>

              {movementModal.type !== "ENTRADA" && (
                <div>
                  <Label className="text-zinc-400">Tipo de Saída *</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setMovementModal((prev) => ({ ...prev, type: "SAIDA_USO" }))}
                      className={`h-9 rounded-md border text-xs font-cinzel font-bold flex items-center justify-center gap-1.5 ${
                        movementModal.type === "SAIDA_USO"
                          ? "border-amber-400 bg-amber-400 text-black"
                          : "border-primary/20 bg-black/40 text-zinc-400"
                      }`}
                    >
                      <Flame className="h-3.5 w-3.5" /> Uso / Ritual
                    </button>

                    <button
                      type="button"
                      onClick={() => setMovementModal((prev) => ({ ...prev, type: "SAIDA_AVARIA" }))}
                      className={`h-9 rounded-md border text-xs font-cinzel font-bold flex items-center justify-center gap-1.5 ${
                        movementModal.type === "SAIDA_AVARIA"
                          ? "border-red-400 bg-red-400 text-black"
                          : "border-primary/20 bg-black/40 text-zinc-400"
                      }`}
                    >
                      <AlertOctagon className="h-3.5 w-3.5" /> Avaria / Perda
                    </button>
                  </div>
                </div>
              )}

              <div>
                <Label className="text-zinc-400">Quantidade ({movementModal.item.unit}) *</Label>
                <Input
                  type="number"
                  min="1"
                  value={movementForm.amount}
                  onChange={(e) => setMovementForm({ ...movementForm, amount: parseInt(e.target.value, 10) || 1 })}
                  className="bg-black/60 border-primary/20 text-xs mt-1"
                />
              </div>

              <div>
                <Label className="text-zinc-400">
                  {movementModal.type === "ENTRADA"
                    ? "Origem / Motivo da Entrada"
                    : movementModal.type === "SAIDA_AVARIA"
                    ? "Motivo da Avaria (Ex: Quebra, Vencido, Derrubado...)"
                    : "Destino / Nome do Ritual *"}
                </Label>
                <Input
                  value={movementForm.reason}
                  onChange={(e) => setMovementForm({ ...movementForm, reason: e.target.value })}
                  placeholder={
                    movementModal.type === "ENTRADA"
                      ? "Ex: Compra mensal atacado, doação..."
                      : movementModal.type === "SAIDA_AVARIA"
                      ? "Ex: Quebrou durante transporte, cera derretida..."
                      : "Ex: Rito de Lúcifer, Firmeza de Mammon..."
                  }
                  className="bg-black/60 border-primary/20 text-xs mt-1"
                />
              </div>

              <div>
                <Label className="text-zinc-400">Responsável</Label>
                <Input
                  value={movementForm.responsible}
                  onChange={(e) => setMovementForm({ ...movementForm, responsible: e.target.value })}
                  className="bg-black/60 border-primary/20 text-xs mt-1"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMovementModal({ isOpen: false, item: null, type: "SAIDA_USO" })}
                className="border-primary/20 text-xs"
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleExecuteMovement}
                className={`font-cinzel text-xs uppercase font-bold text-black ${
                  movementModal.type === "ENTRADA"
                    ? "bg-emerald-500 hover:bg-emerald-400"
                    : movementModal.type === "SAIDA_AVARIA"
                    ? "bg-red-400 hover:bg-red-300"
                    : "bg-amber-500 hover:bg-amber-400"
                }`}
              >
                Confirmar {movementModal.type === "ENTRADA" ? "Entrada" : "Baixa"}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* MODAL DE NOVO / EDITAR ITEM */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto border-primary/40 bg-zinc-950 p-6 text-zinc-200">
            <div className="flex items-center justify-between border-b border-primary/20 pb-3 mb-4">
              <h3 className="font-cinzel text-lg text-primary">
                {editingItem ? "Editar Insumo" : "Cadastrar Novo Insumo"}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowItemModal(false);
                  setItemErrorMsg(null);
                }}
                className="text-zinc-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {itemErrorMsg && (
              <div className="mb-4 flex items-center gap-2 rounded-md border border-red-500/40 bg-red-500/10 p-2.5 text-xs text-red-300">
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
                <span>{itemErrorMsg}</span>
              </div>
            )}

            <div className="space-y-3.5 text-xs">
              <div>
                <Label className="text-zinc-400">Nome do Item *</Label>
                <Input
                  value={itemForm.name || ""}
                  onChange={(e) => {
                    setItemErrorMsg(null);
                    setItemForm((prev) => ({ ...prev, name: e.target.value }));
                  }}
                  placeholder="Ex: Vela 7 Dias, Resina de Mirra, Vinho Tinto..."
                  className="bg-black/60 border-primary/20 text-xs mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-zinc-400">Categoria Principal *</Label>
                  <select
                    value={itemForm.category || categories[0]?.name}
                    onChange={(e) => {
                      setItemErrorMsg(null);
                      const newCatName = e.target.value;
                      const foundCat = categories.find((c) => c.name === newCatName);
                      const subs = foundCat?.subcategories || ["Geral"];
                      setItemForm((prev) => ({
                        ...prev,
                        category: newCatName,
                        subcategory: subs[0] || "Geral",
                      }));
                    }}
                    className="w-full h-9 rounded-md border border-primary/20 bg-black/60 px-3 text-xs text-zinc-200 mt-1"
                  >
                    {categories.map((cat) => (
                      <option key={cat.name} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-zinc-400">Subcategoria (Agrupamento) *</Label>
                  <select
                    value={itemForm.subcategory || ""}
                    onChange={(e) => {
                      setItemErrorMsg(null);
                      const selectedSub = e.target.value;
                      setItemForm((prev) => ({
                        ...prev,
                        subcategory: selectedSub,
                      }));
                    }}
                    className="w-full h-9 rounded-md border border-primary/20 bg-black/60 px-3 text-xs text-zinc-200 mt-1"
                  >
                    {(() => {
                      const activeCat = categories.find((c) => c.name === itemForm.category);
                      const subList = activeCat?.subcategories || ["Geral"];
                      const hasCurrent = itemForm.subcategory && subList.includes(itemForm.subcategory);
                      const completeList = hasCurrent
                        ? subList
                        : itemForm.subcategory
                        ? [itemForm.subcategory, ...subList]
                        : subList;

                      return completeList.map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ));
                    })()}
                  </select>
                </div>
              </div>

              <div>
                <Label className="text-zinc-400">Variação / Cor / Tipo</Label>
                <Input
                  value={itemForm.colorVariant || ""}
                  onChange={(e) => {
                    setItemErrorMsg(null);
                    setItemForm((prev) => ({ ...prev, colorVariant: e.target.value }));
                  }}
                  placeholder="Ex: Preta e Vermelha, Dourada, Seco, 100% Cera..."
                  className="bg-black/60 border-primary/20 text-xs mt-1"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-zinc-400">Qtd Inicial / Saldo</Label>
                  <Input
                    type="number"
                    min="0"
                    value={itemForm.quantity ?? 0}
                    onChange={(e) => {
                      const q = parseFloat(e.target.value) || 0;
                      const u = itemForm.unitPrice ?? 0;
                      setItemForm((prev) => ({
                        ...prev,
                        quantity: q,
                        totalPrice: q * u,
                      }));
                    }}
                    className="bg-black/60 border-primary/20 text-xs mt-1"
                  />
                </div>

                <div>
                  <Label className="text-zinc-400">Unidade</Label>
                  <select
                    value={itemForm.unit || "un"}
                    onChange={(e) => setItemForm((prev) => ({ ...prev, unit: e.target.value }))}
                    className="w-full h-9 rounded-md border border-primary/20 bg-black/60 px-3 text-xs text-zinc-200 mt-1"
                  >
                    <option value="un">un (unidades)</option>
                    <option value="cx">cx (caixas)</option>
                    <option value="pct">pct (pacotes)</option>
                    <option value="gf">gf (garrafas)</option>
                    <option value="g">g (gramas)</option>
                    <option value="kg">kg</option>
                    <option value="L">L (litros)</option>
                  </select>
                </div>

                <div>
                  <Label className="text-zinc-400">Alerta Mínimo</Label>
                  <Input
                    type="number"
                    min="1"
                    value={itemForm.minQuantityAlert ?? 5}
                    onChange={(e) =>
                      setItemForm((prev) => ({
                        ...prev,
                        minQuantityAlert: parseFloat(e.target.value) || 1,
                      }))
                    }
                    className="bg-black/60 border-primary/20 text-xs mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 rounded border border-primary/15 bg-black/40 p-3">
                <div>
                  <Label className="text-zinc-300 font-semibold flex items-center gap-1">
                    Valor Unitário (R$)
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={itemForm.unitPrice ?? 0}
                    onChange={(e) => {
                      const u = parseFloat(e.target.value) || 0;
                      const q = itemForm.quantity ?? 0;
                      setItemForm((prev) => ({
                        ...prev,
                        unitPrice: u,
                        totalPrice: q * u,
                      }));
                    }}
                    placeholder="0.00"
                    className="bg-black/80 border-primary/30 text-xs mt-1 text-emerald-400 font-mono font-bold"
                  />
                </div>

                <div>
                  <Label className="text-zinc-300 font-semibold flex items-center gap-1">
                    Valor Total (R$)
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={itemForm.totalPrice ?? 0}
                    onChange={(e) => {
                      const t = parseFloat(e.target.value) || 0;
                      setItemForm((prev) => ({
                        ...prev,
                        totalPrice: t,
                      }));
                    }}
                    placeholder="0.00"
                    className="bg-black/80 border-primary/30 text-xs mt-1 text-emerald-400 font-mono font-bold"
                  />
                  <span className="text-[10px] text-zinc-500 mt-0.5 block">Calculado: Qtd × Unitário</span>
                </div>
              </div>

              <div>
                <Label className="text-zinc-400">Localização no Templo</Label>
                <Input
                  value={itemForm.location || ""}
                  onChange={(e) => setItemForm((prev) => ({ ...prev, location: e.target.value }))}
                  placeholder="Ex: Armário de Firmezas, Adega, Gaveta 2..."
                  className="bg-black/60 border-primary/20 text-xs mt-1"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowItemModal(false);
                  setItemErrorMsg(null);
                }}
                className="border-primary/20 text-xs"
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleSaveItem}
                className="bg-primary text-black font-cinzel text-xs uppercase font-bold hover:bg-white"
              >
                Salvar Insumo
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}