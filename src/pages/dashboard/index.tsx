import { Textarea } from '@/components/textarea';
import styles from './styles.module.css';
import { GetServerSideProps } from 'next';
import { ChangeEvent, useState, useEffect, use } from 'react';
import {getSession, useSession} from 'next-auth/react';
import {FiShare2} from 'react-icons/fi';
import {FaTrash} from 'react-icons/fa';
import Head from 'next/head';
import Link from 'next/link';
import { db } from '@/services/firebaseConnection'; // Ensure this import is correct based on your project structure
import { collection, addDoc, query, orderBy, where, onSnapshot, doc, deleteDoc } from 'firebase/firestore';

interface DashboardProps {
  user: {
    name: string;
    email: string;
  };
}

interface TaskProps {
  id: string; 
  created: Date;
  public: boolean;
  tarefa: string;
  user: string;
}

export default function Dashboard({user}:DashboardProps) {
  const [input, setInput] = useState('');
  const [publicTask, setPublicTask] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<TaskProps[]>([]);
  
  useEffect(() => {
    async function loadTasks() {
      const tarefasRef = collection(db, `tasks`);
      const q = query(
        tarefasRef,
        orderBy('created', 'desc'),
        where('user', '==', user?.email)
      )
      
      onSnapshot(q, (snapshot) => {
        let lista = [] as TaskProps[];
        snapshot.forEach((doc) => {
          lista.push({
            id: doc.id,
            created: doc.data().created,
            public: doc.data().public,
            tarefa: doc.data().tarefa,
            user: doc.data().user,
          });
        });

        setTasks(lista);
      })
    }

    loadTasks();
  },[user?.email]);

  function handleInputChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(event.target.value);
  }

  function handlePublicChange(event: ChangeEvent<HTMLInputElement>) {
    setPublicTask(event.target.checked);
  }

  async function handleRegisterTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    
    try{
      await addDoc(collection(db, `tasks`), {
        tarefa: input,
        created: new Date(),
        user: user?.email,
        public: publicTask,
      });
      alert('Tarefa registrada com sucesso!');
      setInput('');
    }catch(err){
      console.error("Erro ao registrar tarefa:", err);
    }
  }

  async function handleShare(id: string) {
    await navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_URL}/task/${id}`);
    alert('Link copiado com sucesso!');
  }

  async function handleDelete(id: string) {
    const docRef = doc(db, `tasks`, id);
    await deleteDoc(docRef);
    alert('Tarefa deletada com sucesso!');
  }

  return (
    <>
      <Head>
        <title>Tarefas de {user?.name}</title>
      </Head>
      <main className={styles.dashboard}>
        <section className={styles.content}>
          <div className={styles.contentForm}>
            <h1>Qual sua tarefa?</h1>
            <form onSubmit={handleRegisterTask}>
              <Textarea
                placeholder='Digite aqui sua tarefa...'
                required
                autoFocus
                value={input}
                onChange={handleInputChange}
              ></Textarea>
              <div className={styles.checkboxArea}>
                <input type="checkbox" checked={publicTask} id="important" onChange={handlePublicChange}  />
                <label htmlFor="important">Marcar como pública</label>
              </div>
              <button type='submit' className={styles.button}>
                Registrar
              </button>
            </form>
          </div>
        </section>
        <section className={styles.taskContainer}>
          <h1>Minhas tarefas</h1>
          {tasks.map((item) => (
            <article key={item.id} className={styles.task}>
              {item.public && (
                <div className={styles.tagContainer}>
                  <label className={styles.tag}>Pública</label>
                  <button className={styles.shareButton} onClick={() => handleShare(item.id)}>
                    <FiShare2 size={22} color='#3183ff'/>
                  </button>
                </div>
              )}
              <div className={styles.taskContent}>
                {item.public  ? (
                  <Link href={`/task/${item.id}`}>
                    <p>{item.tarefa}</p>
                  </Link>
                ) : (
                  <p>{item.tarefa}</p>
                )}
                <button className={styles.tashButton} onClick={() => handleDelete(item.id)}>
                  <FaTrash size={22} color='#ea3140'/>
                </button>
              </div>
            </article>
          ))}

        </section>
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({req}) => {
  const session = await getSession({req});
  if (!session?.user) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }
  return {
    props:{
      user: {
        name: session.user.name,
        email: session.user.email,
      },
    }
  }
}