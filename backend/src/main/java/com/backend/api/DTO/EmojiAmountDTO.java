package com.backend.api.DTO;

public class EmojiAmountDTO {
    
    private int index;
    private int amount;
    
    public EmojiAmountDTO() {
        
    }
    
    public EmojiAmountDTO(int index, int amount) {
        this.index = index;
        this.amount = amount;
    }
    
    public void setIndex(int index) {
        this.index = index;
    }
    
    public int getIndex() {
        return this.index;
    }
    
    public void setAmount(int amount) {
        this.amount = amount;
    }
    
    public int getAmount() {
        return this.amount;
    }
    
}
