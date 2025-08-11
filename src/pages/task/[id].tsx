import Head from 'next/head';
import styles from './styles.module.css';
import { GetServerSideProps } from 'next';
import {db} from '@/services/firebaseConnection'; 
import { doc, collection, query, where, getDoc, addDoc } from 'firebase/firestore';
import { Textarea } from '@/components/textarea';
import { ChangeEvent, FormEvent, useState } from 'react';
import { useSession } from 'next-auth/react';

interface TaskProps{
  item:{
    id: string;
    tarefa: string;
    created: string;
    public: boolean;
    user: string;
  }
}


export default function TaskPage({item} : TaskProps) {
  const {data: session} = useSession();
  const [comment, setComment] = useState('');

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

      alert('Comentário registrado com sucesso!');

      setComment('')
    }catch(error) {
      console.log(error);
      alert('Erro ao registrar comentário!');
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
      </main>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({params}) => {
  const id = params?.id as string;
  const docRef = doc(db, 'tasks', id);
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
    },
  };
};