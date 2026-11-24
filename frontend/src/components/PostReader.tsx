import { use, useEffect, useState } from "react";
import { Post } from "../types";
import { authService } from "@/services/authService";
import Dialog from "./Dialog";
import { useGuestAuth, STORAGE_KEY } from "@/context/GuestContext";
import Banner from "./Banner";
import { postService } from "@/services/postService";
interface Props {
  post: Post;
  onEdit?: () => void;
  onDelete?: () => void;
  deleteConfirm: boolean;
  onCancelDelete: () => void;
  onReaction: (emoji: string) => Promise<number>;
  onDeleteReactions: (id: string) => void;
  onGetEmojiAmounts: (id: string) => Promise<number | number[]>;
  onSetAmountEmoji: (id: string, selected: number, value: number) => Promise<number | number[]>;
}

type Italics = {
  textStart: number,
  start: number,
  text: string,
};

export default function PostReader({
  post,
  onEdit,
  onDelete,
  deleteConfirm,
  onCancelDelete,
  onReaction,
  onDeleteReactions,
  onGetEmojiAmounts,
  onSetAmountEmoji,
}: Props) {
  
  const emojiList = ["😄", "😇", "😍", "😎", "🥳", "😞", "😐"];
  
  const [authenticated, _] = useState(authService.isAuthenticated);
  const [confirmReaction, setConfirmReaction] = useState<number | null>(null);
  const [isReacted, setIsReacted] = useState<boolean>(false);
  const [lastIndex, setLastIndex] = useState<number | null>(null);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [isAllZeros, setIsAllZeros] = useState<boolean>(true);
  const [showAll, setShowAll] = useState<boolean>(false);
  const [selectedEmoji, setSelectedEmoji] = useState<number | null>(null);
  const [values, setValues] = useState<number[] | number>(-1);
  const [currValue, setCurrValue] = useState<number>(-1);
  const [, setUpdateEmojies] = useState<boolean>(true);
  
  const { guestId, setGuestId, hasAgreed, setHasAgreed, isAnswered, setIsAnswered } = useGuestAuth();

  const isReactions = () => {
    
    if (!post) setIsAllZeros(true);
    
    let allZeros = true;
    for (const e of post.emojies) {
      if (e > 0) allZeros = false;
    }
    setIsAllZeros(allZeros);
  }

  const getAmountEmojis = async(index: number) => {
    const response = await onGetEmojiAmounts(post.id);
    console.log(response);
            
    if (typeof response === 'object') {
      setSelectedEmoji(index);
      console.log(response[selectedEmoji!]);
      setValues(response);
      return response[selectedEmoji!];
    }
    
    return null;
  }
  
  // this sets the storage key value, if it's null
  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === null && !isAnswered) {
      setGuestId(null);
      setHasAgreed(false);
      setIsAnswered(false);
    }
  }, [guestId, setGuestId]);

  const reactions = guestId === null
    ? null
    : localStorage.getItem(STORAGE_KEY);

  const each = reactions?.split("-");
  
  each?.forEach((id, index) => {
      if (post.id === id && isReacted === false && index >= 5) {
        setIsReacted(true);
      }
    });
   
  const sendEmoji = async(emoji: string) => {
    setConfirmReaction(null);
    const resp = await onReaction(emoji);
    if (resp >= 200 && resp <= 299) {
      setIsReacted(true);
      setLastIndex(emojiList.indexOf(emoji));
      post.emojies[lastIndex!]++;
    } else {
      console.log("Virhe")
    }  
  };
  
  const setAmountEmojies = async() => {

    if (typeof values === 'object') {
      const response = await onSetAmountEmoji(post.id, selectedEmoji!, values[selectedEmoji!]);
      
      // if server here returns 200 OK, it's truth enough for
      // the frontend to set the new emoji alpha values... 
      if (response === 200) {
        setUpdateEmojies(true);
        
        post.emojies[selectedEmoji!] = values[selectedEmoji!];
        if (typeof values === 'object') {
          
          const maxValue = Math.max(...values);
          
          for (let i: number = 0; i < values.length; i++) {
            post.emojies[i] = values[i] / maxValue;
          }
          
          console.log("new emoji values", post.emojies);
        }
      }
      console.log(response);
    }  
  }
  
  useEffect(() => {
    isReactions();
  }, [post])
  
  useEffect(() => { 
    if (typeof values === 'object') setCurrValue(values[selectedEmoji!]);
  }, [currValue])
  
  return (
    <article className="pt-10">
      {post.coverImage && (
        <div className="mb-8 sm:mb-10 overflow-hidden bg-[var(--muted)] aspect-[16/10] sm:aspect-[2/1]">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover opacity-90"
          />
        </div>
      )}

      {/* Meta bar */}
      <div
        className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-6 text-[10px] tracking-[0.1em] uppercase text-[var(--muted-foreground)]"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
        {post.updatedAt !== post.createdAt && (
          <>
            <span className="text-[var(--border)]">·</span>
            <span>Updated {formatDate(post.updatedAt)}</span>
          </>
        )}
        {post.tags.length > 0 && (
          <>
            <span className="text-[var(--border)]">·</span>
            <div className="flex gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="border border-[var(--border)] px-2 py-0.5"
                >
                  {tag}
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Title */}
      <h1
        className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold leading-[1.15] text-[var(--foreground)] mb-6"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {post.title}
      </h1>

      {/* Excerpt as lede */}
      <p
        className="text-lg sm:text-xl text-[var(--muted-foreground)] leading-relaxed mb-8 sm:mb-10 border-l-2 border-[var(--accent)] pl-4 sm:pl-5 italic"
        style={{ fontFamily: "var(--font-body)" }}
      >
        {post.excerpt}
      </p>

      <hr className="border-[var(--border)] mb-10" />

      {/* Body */}
      <div className="prose max-w-none">
        {renderBody(post.body)}
      </div>

      {/* Actions */}
      {onEdit && onDelete && <div className="mt-12 sm:mt-16 pt-8 border-t border-[var(--border)] flex flex-wrap items-center gap-3 sm:gap-4">
        <button
          onClick={onEdit}
          className="text-[11px] tracking-[0.1em] uppercase text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors border border-[var(--border)] hover:border-[var(--foreground)] px-4 py-2 cursor-pointer"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Edit Post
        </button>

        {!deleteConfirm ? (
          <button
            onClick={onDelete}
            className="text-[11px] tracking-[0.1em] uppercase text-[var(--muted-foreground)] hover:text-red-700 transition-colors px-4 py-2 cursor-pointer"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Delete
          </button>
        ) : (
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span
              className="text-[11px] tracking-[0.06em] text-red-700"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Delete permanently?
            </span>
            <button
              onClick={onDelete}
              className="text-[11px] tracking-[0.1em] uppercase text-red-700 border border-red-700 px-3 py-1.5 hover:bg-red-700 hover:text-white transition-colors cursor-pointer"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Confirm
            </button>
            <button
              onClick={onCancelDelete}
              className="text-[11px] tracking-[0.1em] uppercase text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>}
      {!authenticated && !isReacted ?
       <>
       <div className="mt-16 pt-8 border-t border-[var(--border)]">
        <p
          className="text-[11px] tracking-[0.06em] text-[var(--muted-foreground)]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Your reaction to this post:
        </p>
        <p className="flex flex-wrap items-center gap-1">
          {emojiList.map((emoji, index) => (
            <span key={index} className="mr-1 text-[36px] sm:text-[48px] cursor-pointer" onClick={() => { setConfirmReaction(index); } }>{emoji}</span>
          ))}
        </p>
        
        { confirmReaction !== null && !showConfirmation && (!hasAgreed || localStorage.getItem(STORAGE_KEY) === null) && (
          <Banner text_en={"You must first give a concent to save a random token into your browser's local storage."}
                  text_fi={"Sinun on ensin hyväksyttävä satunnaisen tunnisteen lisääminen selaimen tallennustilaan. (fi)"}  
                  btn_no={"I don't concent / En hyväksy"}
                  btn_yes={"Concent / Hyväksyn"}
                  
                  onCancel = {() => { setConfirmReaction(null); setIsAnswered(true); }}
                  onConfirm = {() => { setHasAgreed(true); setIsAnswered(true); setGuestId(null); setShowConfirmation(true); }}      
          />
        )}
        { showConfirmation && <Dialog
            emoji={emojiList[confirmReaction!]}
            title="Confirm action"
            message="Are you sure you want react with the following emoji"
            onCancel={() => { setConfirmReaction(null); setShowConfirmation(false); }}
            onConfirm={async() => { await sendEmoji(emojiList[confirmReaction!]); setShowConfirmation(false); }}
          />
        }
        
        { confirmReaction !== null && isReacted && hasAgreed && (<Dialog
                    emoji={null}
                    title="Info"
                    message="Coulnd't set reaction (already reacted?)"
                    onCancel={() => {}}
                    onConfirm={() => {setConfirmReaction(null)}}
                    />
                  )
                }
        {confirmReaction !== null && isReacted === false && hasAgreed && localStorage.getItem(STORAGE_KEY) !== null && (
          <Dialog
            emoji={emojiList[confirmReaction]}
            title="Confirm action"
            message="Are you sure you want react with the following emoji"
            onCancel={() => setConfirmReaction(null)}
            onConfirm={async() => await sendEmoji(emojiList[confirmReaction]) }
          />
        )}
        </div>
        </>
      : 
          <div
            className="text-[11px] tracking-[0.06em] text-[var(--muted-foreground)]"
            style={{ fontFamily: "var(--font-mono)" }}
        >
            Overall reactions:
          </div>
      }
          <div className="flex flex-col items-start gap-3">
          <div className="items-center gap-3"
            style={{ fontFamily: "var(--font-mono)" }}>
              {isAllZeros ? (<span className="tracking-[0.06em] text-[var(--muted-foreground)]">No reactions yet.</span>) : (<>
              
              {post.emojies.map((alpha, index) => {
                const emoji = emojiList[index];
                
                if (!emoji && lastIndex === null) return null;

                let opacity: number;
                if (!showAll) opacity = alpha >= 0.3 ? alpha : 0;
                else opacity = alpha > 0 ? 1 : 0;
                
                return (
                  opacity > 0 &&
                  <span
                    key={emoji}
                    style={{ opacity }}
                    title={`${Math.round(opacity * 100)}%`}
                    onClick={authenticated === true ? () => getAmountEmojis(index) : undefined}
                    className={authenticated === true ? "cursor-pointer" : undefined}
                  >
                    {emoji}
                  </span>
                );
              })}
              </>)
              }
          </div>
          {authenticated && (
            <div className="grid w-fit grid-cols-[12.5rem_12.5rem] gap-x-3 gap-y-3">
              {!isAllZeros && (
                <>
                  <button
                    onClick={() => { onDeleteReactions(post.id); post.emojies = [0,0,0,0,0,0,0]; }}
                    className="w-full text-[11px] tracking-[0.1em] uppercase text-red-700 border border-red-700 px-3 py-1.5 hover:bg-red-700 hover:text-white transition-colors cursor-pointer"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    Delete all reactions
                  </button>
                  <button
                    onClick={() => setShowAll(!showAll)}
                    className="w-full text-[11px] tracking-[0.1em] uppercase text-red-700 border border-red-700 px-3 py-1.5 hover:bg-red-700 hover:text-white transition-colors cursor-pointer"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {showAll ? "Show only reactions with alhpa >=0.3" : "Show all reactions"}
                  </button>
                </>
              )}
              {selectedEmoji !== null && typeof values === "object" && (
                <>
                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-10 text-[29px]">{emojiList[selectedEmoji!]}</span>
                      <span className="w-10 px-3 py-1.5 text-right text-[17px] tabular-nums">{values[selectedEmoji!]}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="text-[17px] tracking-[0.1em] uppercase text-red-700 border border-red-700 px-3 py-1.5 hover:bg-red-700 hover:text-white transition-colors cursor-pointer"
                        onClick={() => { currValue > 0 && values[selectedEmoji!]--; setCurrValue(values[selectedEmoji!]); setUpdateEmojies(false); }}
                      >
                        -
                      </button>
                      <button
                        className="text-[17px] tracking-[0.1em] uppercase text-red-700 border border-red-700 px-3 py-1.5 hover:bg-red-700 hover:text-white transition-colors cursor-pointer"
                        onClick={() => { values[selectedEmoji!]++; setCurrValue(values[selectedEmoji!]); setUpdateEmojies(false); }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      className="text-[11px] tracking-[0.1em] uppercase text-red-700 border border-red-700 px-3 py-1.5 hover:bg-red-700 hover:text-white transition-colors cursor-pointer"
                      onClick={setAmountEmojies}
                    >
                      Set
                    </button>
                    <button className="text-[11px] tracking-[0.1em] uppercase text-red-700 border border-red-700 px-3 py-1.5 hover:bg-red-700 hover:text-white transition-colors cursor-pointer">
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
          </div>
    </article>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function renderBody(body: string) {
  const paragraphs = body.split(/\n/);
  return paragraphs.map((block, i) => {
    if (block.startsWith(">")) {
      return (
        <blockquote key={i} className="prose">
          {block.slice(2)}
        </blockquote>
      );
    }
    if (block.startsWith("**") && block.endsWith("**")) {
      return (
        <h3
          key={i}
          className="font-serif text-xl font-semibold mt-8 mb-3 text-[var(--foreground)]"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {block.slice(2, -2)}
        </h3>
      );
    }
    if (block.includes("*")) {
      let italicText = "";
      let start = 0, end = -1, textStart = 0;
      let italics: Italics[] = [];
      
      for (let i = 0; i < block.length; i++) {
        
        if (block[i] === "*" && i !== end) {
          start = i + 1;
          
          for (let j = i + 1; j < block.length; j++) {
            italicText += block[j];
            if (block[j] === "*") {
              italicText = italicText.slice(0, -1);
              end = j;
              
              italics.push({
                textStart: textStart,
                start: start,
                text: italicText
              });
              italicText = "";
              textStart = j + 1;
              break;
            }
          }
        }
      }
      // print all *emphasized* text areas as emphasized in a paragraph
      return (<div key={i}>
        {italics.length > 0 && italics.map((it, index) => (<span key={i.toString() + index.toString()}>
          {block.slice(it.textStart, it.start - 1)}
          <em>{it.text}</em>
          {index === italics.length - 1 && block.slice(it.start + 1 + it.text.length, block.length) }
        </span>
        ))}
      </div>
      )
    } 
    if (block.includes("\n- ")) {
      const [heading, ...items] = block.split("\n- ");
      return (
        <div key={i}>
          {heading && (
            <p className="prose" style={{ fontFamily: "var(--font-body)" }}>
              {heading}
            </p>
          )}
          <ul className="list-none space-y-1 mb-5">
            {items.map((item, j) => (
              <li
                key={j}
                className="flex gap-3 text-[var(--foreground)] leading-relaxed"
                style={{ fontFamily: "var(--font-body)" }}
              >
                <span className="text-[var(--accent)] mt-1 shrink-0">—</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      );
    }
    return (
      <p
        key={i}
        className="prose"
        style={{ fontFamily: "var(--font-body)", lineHeight: "1.8", marginBottom: "1.25rem", fontSize: "1.0625rem" }}
      >
        {block}
      </p>
    );
  });
}
