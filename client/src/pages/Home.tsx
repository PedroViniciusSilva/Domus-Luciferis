import { Button } from "@/components/ui/button";
import MainLayout from "@/components/MainLayout";
import { motion } from "framer-motion";

export default function Home() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/60 z-10" />
          <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black z-10" />
          <img 
            src="/images/hero_bg.jpg" 
            alt="Temple Atmosphere" 
            className="w-full h-full object-cover opacity-80"
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-20 container mx-auto px-4 text-center">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-4xl mx-auto"
          >
            <motion.div variants={fadeIn} className="mb-6 flex justify-center">
              <img 
                src="/images/logo.jpg" 
                alt="Domus Luciferis Logo" 
                className="w-32 h-32 md:w-48 md:h-48 rounded-full border-2 border-primary/50 shadow-[0_0_30px_rgba(212,175,55,0.2)]"
              />
            </motion.div>
            
            <motion.h1 variants={fadeIn} className="text-4xl md:text-6xl lg:text-7xl font-cinzel font-bold text-white mb-4 tracking-wider">
              DOMUS <span className="text-gold-gradient">LUCIFERIS</span>
            </motion.h1>
            
            <motion.p variants={fadeIn} className="text-lg md:text-xl text-gray-300 mb-10 font-light tracking-wide max-w-2xl mx-auto">
              Lucidez. Conhecimento. Autonomia.
            </motion.p>
            
            <motion.div variants={fadeIn}>
              <a 
                href="https://chat.whatsapp.com/HhpYGYoCqkdDSrTpayzUjctex"
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button size="lg" className="bg-primary text-black hover:bg-white hover:text-black font-cinzel font-bold tracking-widest px-8 py-6 text-lg rounded-sm transition-all duration-500 shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_40px_rgba(255,255,255,0.5)]">
                  JUNTE-SE A NÓS
                </Button>
              </a>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20"
        >
          <div className="w-[1px] h-24 bg-gradient-to-b from-primary to-transparent mx-auto" />
        </motion.div>
      </section>

      {/* Introduction Section */}
      <section className="py-24 bg-background relative">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="absolute -inset-4 border border-primary/20 z-0" />
              <img 
                src="/images/altar_detail.jpg" 
                alt="Altar Detail" 
                className="relative z-10 w-full h-auto shadow-2xl grayscale-[30%] hover:grayscale-0 transition-all duration-700"
              />
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-4xl font-cinzel text-primary mb-6">O Caminho da Lucidez</h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                O templo surge não como um espaço de culto cego, mas como um local de trabalho espiritual, onde a Bruxaria e o Luciferianismo caminham juntos com ética, consciência e propósito.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Cada ritual, cada magia, cada orientação é realizada com responsabilidade, clareza de intenção e respeito absoluto ao livre-arbítrio.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* History Section */}
      <section id="historia" className="py-24 bg-[#080808] relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto text-center mb-16"
          >
            <img src="/images/symbol_quill.png" alt="Quill Icon" className="h-16 mx-auto mb-6 opacity-80" />
            <h2 className="text-3xl md:text-5xl font-cinzel text-white mb-4">Nossa História</h2>
            <div className="w-24 h-1 bg-primary mx-auto" />
          </motion.div>

          <div className="max-w-4xl mx-auto space-y-12 text-lg text-gray-300 leading-relaxed font-light">
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <span className="text-primary font-cinzel text-4xl float-left mr-3 mt-[-10px]">N</span>ossa história tem início muito antes da fundação formal do templo. Ela começa na vivência pessoal, na escuta atenta e na construção silenciosa de um caminho espiritual que se revelou ao longo dos anos.
            </motion.p>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Desde os 13 anos, mantenho um diálogo consciente e contínuo com Lúcifer, não como figura de temor ou caricatura religiosa, mas como patrono da lucidez, do conhecimento, da autonomia e da responsabilidade espiritual. Esse vínculo não nasceu do impulso, mas da observação, da experiência direta e do amadurecimento interno.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-primary/5 border-l-2 border-primary p-8 my-12 italic"
            >
              "Em junho de 2025, após um chamado direto e inequívoco... compreendi que já não bastava viver esse caminho de forma individual. A partir desse momento, iniciei-me formalmente no Satanismo e assumi uma promessa: transformar vivência em estrutura, conhecimento em serviço e prática em responsabilidade coletiva."
            </motion.div>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="text-center font-cinzel text-2xl text-primary"
            >
              Assim nasceu o templo.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section id="missao" className="py-24 bg-background relative">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Acolhimento Consciente",
                desc: "Atuamos para ajudar na quebra de ciclos nocivos e no fortalecimento pessoal, sem promessas vazias ou ilusões."
              },
              {
                title: "Autonomia Espiritual",
                desc: "Não estimulamos dependência, mas fortalecimento interno. Lúcifer é aquele que exige responsabilidade sobre escolhas."
              },
              {
                title: "Enfrentamento Real",
                desc: "Não promovemos fuga da realidade, mas enfrentamento. Todo caminho verdadeiro exige disciplina, verdade e coragem."
              }
            ].map((item, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                className="bg-[#0A0A0A] border border-white/5 p-8 hover:border-primary/30 transition-colors duration-500 group"
              >
                <div className="h-1 w-12 bg-primary mb-6 group-hover:w-full transition-all duration-500" />
                <h3 className="text-xl font-cinzel text-white mb-4 group-hover:text-primary transition-colors">{item.title}</h3>
                <p className="text-muted-foreground font-light leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-secondary/10 z-0" />
        <div className="absolute inset-0 bg-[url('/images/hero_bg.jpg')] bg-cover bg-center opacity-20 mix-blend-overlay z-0" />
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-cinzel font-bold text-white mb-8"
          >
            Faça Algo Bonito
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto font-light"
          >
            Seguimos firmes, ajudando, ensinando e praticando. Junte-se à nossa egrégora.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <a 
              href="https://chat.whatsapp.com/HhpYGYoCqkdDSrTpayzUjc"
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Button size="lg" className="bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-black font-cinzel font-bold tracking-widest px-10 py-8 text-xl rounded-sm transition-all duration-500">
                ACESSE O GRUPO NO WHATSAPP
              </Button>
            </a>
          </motion.div>
        </div>
      </section>
    </MainLayout>
  );
}
