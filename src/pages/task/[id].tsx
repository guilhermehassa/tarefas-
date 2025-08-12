import Head from 'next/head';
import styles from './styles.module.css';
import { GetServerSideProps } from 'next';
import {db} from '@/services/firebaseConnection'; 
import { doc, collection, query, where, getDoc, getDocs, addDoc, deleteDoc } from 'firebase/firestore';
import { Textarea } from '@/components/textarea';
import { ChangeEvent, FormEvent, useState } from 'react';
import { useSession } from 'next-auth/react';
import { FaTrash} from 'react-icons/fa';
interface TaskProps{
  item:{
    id: string;
    tarefa: string;
    created: string;
    public: boolean;
    user: string;
  }
  allComments: CommentProps[];
}

interface CommentProps {
  id: string;
  comment: string;
  taskId: string;
  user: string;
  name: string;
}


export default function TaskPage({item, allComments} : TaskProps) {
  const {data: session} = useSession();
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<CommentProps[]>(allComments || []);

  async function handleRegisterComment(e: FormEvent) {
    e.preventDefault();

    if(comment.length === 0) {
      alert('Digite um comentário para enviar!');
      return;
    }

    if(!session?.user?.email || !session?.user?.name) {
      alert('Você precisa estar logado para comentar!');
      return;
    }

    try{
      const docRef = await addDoc(collection(db, 'comments'), {
        comment: comment,
        created: new Date(),
        user: session.user?.email,
        name: session.user.name,
        taskId: item?.id,
      });

      const newComment = {
        id: docRef.id,
        comment: comment,
        user: session.user?.email,
        name: session.user?.name,
        taskId: item?.id,
      }

      setComments((oldItems) => [...oldItems, newComment]);

      alert('Comentário registrado com sucesso!');

      setComment('')
    }catch(error) {
      console.log(error);
      alert('Erro ao registrar comentário!');
    }
  }

  async function handleDelete(id: string) {
    const docRef = doc(db, `comments`, id);

    try{
      await deleteDoc(docRef);
      let updatedComments = comments.filter(item => item.id !== id);
      alert('Comentário deletado com sucesso!');
      setComments(updatedComments);
    } catch(error) {
      console.error("Erro ao deletar comentário:", error);
      alert('Erro ao deletar comentário!');
    }
  }

  return(
    <>
      <Head>
        <title>Tarefa de {item.user}</title>
      </Head>
      <main className={styles.container}>
        <h1>Tarefa</h1>
        <article className={styles.content}>
          <p>
            {item.tarefa}
          </p>
        </article>

        <section className={styles.commentsContainer}>
          <h2>Deixar Comentário</h2>
          <form onSubmit={handleRegisterComment}>
            <Textarea
              placeholder='Digite seu comentário...'
              value={comment}

              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setComment(e.target.value)}
            />
            <button
              className={styles.button}
              disabled={!session?.user}
              >
              Enviar Comentario
            </button>
          </form>
        </section>

        <section className={styles.commentsContainer}>
          <h2>Comentários</h2>
          {comments.length === 0 ? (
            <span>Nenhum comentário registrado!</span>
          ) : comments.map((item) => (
            <article key={item.id} className={styles.comment}>
              <div className={styles.headComment}>
                <label className={styles.commentsLabel}>{item.name}</label>
                {session?.user?.email === item.user && (
                  <button className={styles.buttonTrash} onClick={() => handleDelete(item.id)}>
                    <FaTrash color='#EA3140' size={18} />
                  </button>
                )}
              </div>
              <p>{item.comment}</p>
            </article>
          ))}
        </section>
      </main>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({params}) => {
  const id = params?.id as string;
  const docRef = doc(db, 'tasks', id);

  const q = query(collection(db, 'comments'), where('taskId', '==', id));
  const snapshotComments = await getDocs(q);
  let allComments: CommentProps[] = [];
  snapshotComments.forEach((doc) => {
    allComments.push({
      id: doc.id,
      comment: doc.data().comment,
      taskId: doc.data().taskId,
      user: doc.data().user,
      name: doc.data().name,
    });
  });

  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  if(!snapshot.data()?.public){
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  const miliseconds = snapshot.data()?.created?.seconds * 1000;
  
  const task = {
    id: snapshot.id,
    tarefa: snapshot.data()?.tarefa,
    created: new Date(miliseconds).toLocaleDateString(),
    public: snapshot.data()?.public,
    user: snapshot.data()?.user,
  }

  return {
    props: {
      item: task,
      allComments: allComments,
    },
  };
};