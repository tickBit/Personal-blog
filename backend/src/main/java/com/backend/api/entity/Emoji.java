package com.backend.api.entity;

import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;

import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "emoji")
public class Emoji {
    
    private static final List<String> EMOJI_LIST =
        List.of("😄", "😇", "😍", "😎", "🥳", "😞", "😐");
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private int grinning_face;

    @Column(nullable = false)
    private int smiling_face_with_halo;
    
    @Column(nullable = false)
    private int smiling_face_with_heart_eyes;
    
    @Column(nullable = false)
    private int smiling_face_with_sunglasses;
    
    @Column(nullable = false)
    private int partying_face;
    
    @Column (nullable = false)
    private int disappointed_face;
    
    @Column (nullable = false)
    private int neutral_face;
    
    // Each emoji summary belongs to one post; this side stores the post_id foreign key.
    @OneToOne
    @JoinColumn(name = "post_id", nullable = false, unique = true)
    private Post post;

    public Post getPost() {
        return post;
    }
    
    public void setPost(Post post) {
        this.post = post;
    }
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public void addReaction(String name) {
        
        System.out.println("Index" + EMOJI_LIST.lastIndexOf(name));
        switch (EMOJI_LIST.indexOf(name)) {
            case 0:
                this.grinning_face += 1;
                break;
            case 1:
                this.smiling_face_with_halo += 1;
                break;
            case 2:
                this.smiling_face_with_heart_eyes += 1;
                break;
            case 3:
                this.smiling_face_with_sunglasses += 1;
                break;
            case 4:
                this.partying_face += 1;
                break;
            case 5:
                this.disappointed_face += 1;
                break;
            case 6:
                this.neutral_face += 1;
                break;
            default:
                throw new IllegalArgumentException("Invalid emoji name: " + name);
        }
    }
    
    public float[] getEmojiAlphas() {
        int amountOfEmojies[] = {this.grinning_face, this.smiling_face_with_halo, this.smiling_face_with_heart_eyes, this.smiling_face_with_sunglasses, this.partying_face, this.disappointed_face, this.neutral_face};
        
        // get max value of amountOfEmojies
        int max = 0;
        for (int i = 0; i < amountOfEmojies.length; i++) {
            if (amountOfEmojies[i] > max) {
                max = amountOfEmojies[i];
            }
        }
        
        float alphaForEmojies[] = new float[amountOfEmojies.length];
        for (int i = 0; i < amountOfEmojies.length; i++) {
            alphaForEmojies[i] = (float) amountOfEmojies[i] / (float) max;
        }
        
        // return integer list of emojies
        return alphaForEmojies;
    }
    
    public Emoji() {
        this.grinning_face = 0;
        this.smiling_face_with_halo = 0;
        this.smiling_face_with_heart_eyes = 0;
        this.smiling_face_with_sunglasses = 0;
        this.partying_face = 0;
        this.disappointed_face = 0;
        this.neutral_face = 0;
    }
    
    // Getter and setter for the model
    public Emoji getEmoji() {
        return this;
    }
}
