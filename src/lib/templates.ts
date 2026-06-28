export interface DiagramTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  nodes: {
    id: string;
    label: string;
    type: string;
    x: number;
    y: number;
  }[];
  edges: {
    source: string;
    target: string;
    label: string;
  }[];
}

export const templates: DiagramTemplate[] = [
  {
    id: "escola",
    name: "Sistema Escolar",
    description: "Modelo completo de gestao escolar com alunos, professores e turmas",
    icon: "🎓",
    category: "Educacao",
    nodes: [
      { id: "1", label: "Aluno", type: "class", x: 50, y: 150 },
      { id: "2", label: "Professor", type: "class", x: 300, y: 50 },
      { id: "3", label: "Turma", type: "class", x: 300, y: 250 },
      { id: "4", label: "Disciplina", type: "class", x: 550, y: 150 },
      { id: "5", label: "Avaliacao", type: "class", x: 550, y: 350 },
    ],
    edges: [
      { source: "1", target: "3", label: "pertence" },
      { source: "2", target: "3", label: "lecciona" },
      { source: "3", target: "4", label: "tem" },
      { source: "1", target: "5", label: "recebe" },
    ],
  },
  {
    id: "ecommerce",
    name: "E-Commerce",
    description: "Sistema de loja online com produtos, pedidos e clientes",
    icon: "🛒",
    category: "Comercio",
    nodes: [
      { id: "1", label: "Cliente", type: "class", x: 50, y: 150 },
      { id: "2", label: "Pedido", type: "class", x: 300, y: 100 },
      { id: "3", label: "Produto", type: "class", x: 550, y: 150 },
      { id: "4", label: "Pagamento", type: "class", x: 300, y: 300 },
      { id: "5", label: "Carrinho", type: "class", x: 150, y: 300 },
      { id: "6", label: "Categoria", type: "class", x: 700, y: 100 },
    ],
    edges: [
      { source: "1", target: "2", label: "faz" },
      { source: "2", target: "3", label: "contem" },
      { source: "2", target: "4", label: "tem" },
      { source: "1", target: "5", label: "usa" },
      { source: "3", target: "6", label: "pertence" },
    ],
  },
  {
    id: "banco",
    name: "Sistema Bancario",
    description: "Modelo de sistema bancario com contas, transaccoes e clientes",
    icon: "🏦",
    category: "Financas",
    nodes: [
      { id: "1", label: "Cliente", type: "class", x: 50, y: 200 },
      { id: "2", label: "Conta", type: "class", x: 300, y: 100 },
      { id: "3", label: "Transaccao", type: "class", x: 550, y: 200 },
      { id: "4", label: "Cartao", type: "class", x: 300, y: 300 },
      { id: "5", label: "Banco", type: "class", x: 150, y: 50 },
    ],
    edges: [
      { source: "1", target: "2", label: "possui" },
      { source: "2", target: "3", label: "realiza" },
      { source: "1", target: "4", label: "tem" },
      { source: "5", target: "2", label: "gere" },
    ],
  },
  {
    id: "hospital",
    name: "Sistema Hospitalar",
    description: "Gestao hospitalar com pacientes, medicos e consultas",
    icon: "🏥",
    category: "Saude",
    nodes: [
      { id: "1", label: "Paciente", type: "class", x: 50, y: 150 },
      { id: "2", label: "Medico", type: "class", x: 300, y: 50 },
      { id: "3", label: "Consulta", type: "class", x: 300, y: 250 },
      { id: "4", label: "Prescricao", type: "class", x: 550, y: 150 },
      { id: "5", label: "Departamento", type: "class", x: 550, y: 350 },
    ],
    edges: [
      { source: "1", target: "3", label: "agenda" },
      { source: "2", target: "3", label: "realiza" },
      { source: "3", target: "4", label: "gera" },
      { source: "2", target: "5", label: "pertence" },
    ],
  },
  {
    id: "biblioteca",
    name: "Biblioteca",
    description: "Sistema de gestao de biblioteca com livros e emprestimos",
    icon: "📚",
    category: "Educacao",
    nodes: [
      { id: "1", label: "Livro", type: "class", x: 50, y: 150 },
      { id: "2", label: "Autor", type: "class", x: 50, y: 350 },
      { id: "3", label: "Membro", type: "class", x: 550, y: 150 },
      { id: "4", label: "Emprestimo", type: "class", x: 300, y: 250 },
      { id: "5", label: "Categoria", type: "class", x: 300, y: 50 },
    ],
    edges: [
      { source: "1", target: "2", label: "escrito por" },
      { source: "3", target: "4", label: "faz" },
      { source: "1", target: "4", label: "em" },
      { source: "1", target: "5", label: "tem" },
    ],
  },
  {
    id: "rh",
    name: "Recursos Humanos",
    description: "Sistema de gestao de recursos humanos",
    icon: "👥",
    category: "Empresarial",
    nodes: [
      { id: "1", label: "Funcionario", type: "class", x: 50, y: 200 },
      { id: "2", label: "Departamento", type: "class", x: 300, y: 100 },
      { id: "3", label: "Cargo", type: "class", x: 300, y: 300 },
      { id: "4", label: "Salario", type: "class", x: 550, y: 200 },
      { id: "5", label: "Avaliacao", type: "class", x: 550, y: 350 },
    ],
    edges: [
      { source: "1", target: "2", label: "pertence" },
      { source: "1", target: "3", label: "ocupa" },
      { source: "1", target: "4", label: "recebe" },
      { source: "1", target: "5", label: "tem" },
    ],
  },
];